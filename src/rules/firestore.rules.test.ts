import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import type {Season} from "../domain/types";
import {updateSeasonDoc} from "../functions/season";
import rules from "../../firestore.rules?raw";
import {addMatchToSeason, approveMatchResult} from "../functions/match/logic";
import {match, period, season} from "../test/factories";

// Eseguito con `npm run test:rules`, che avvia l'emulatore Firestore

let env: RulesTestEnvironment;

const asAdmin = () =>
  env
    .authenticatedContext("admin", {role: "admin"})
    .firestore() as unknown as Firestore;
const asManager = (uid = "manager") =>
  env
    .authenticatedContext(uid, {role: "manager"})
    .firestore() as unknown as Firestore;
const asPlayer = (uid = "a") =>
  env.authenticatedContext(uid).firestore() as unknown as Firestore;
const asGuest = () =>
  env.unauthenticatedContext().firestore() as unknown as Firestore;

const seasonData = (overrides: Partial<Season> = {}) => {
  // l'id non viene salvato nel documento
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {id, ...data} = season({createdBy: "manager", ...overrides});
  return data;
};

const seed = (path: string, data: object) =>
  env.withSecurityRulesDisabled(ctx =>
    setDoc(doc(ctx.firestore() as unknown as Firestore, path), data),
  );

const readSeason = async () => {
  let data: Season | undefined;
  await env.withSecurityRulesDisabled(async ctx => {
    const snap = await getDoc(
      doc(ctx.firestore() as unknown as Firestore, "seasons/s1"),
    );
    data = snap.data() as Season;
  });
  return data!;
};

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-tennis",
    firestore: {rules},
  });
});

afterAll(() => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await seed("seasons/s1", seasonData());
  await seed("players/p1", {
    name: "Mario",
    surname: "Rossi",
    createdBy: "manager",
    userId: "u1",
  });
});

describe("regole: seasons", () => {
  it("chiunque può leggere le stagioni", async () => {
    await assertSucceeds(getDoc(doc(asGuest(), "seasons/s1")));
  });

  it("solo admin e manager creano stagioni", async () => {
    await assertFails(setDoc(doc(asGuest(), "seasons/s2"), seasonData()));
    await assertFails(setDoc(doc(asPlayer(), "seasons/s2"), seasonData()));
    await assertSucceeds(setDoc(doc(asManager(), "seasons/s2"), seasonData()));
    await assertSucceeds(setDoc(doc(asAdmin(), "seasons/s3"), seasonData()));
  });

  it("un utente non autenticato non modifica la stagione", async () => {
    await assertFails(updateDoc(doc(asGuest(), "seasons/s1"), {periods: []}));
  });

  it("un giocatore può modificare solo i periodi", async () => {
    const ref = doc(asPlayer(), "seasons/s1");
    await assertSucceeds(
      updateDoc(ref, {periods: [period([match("m", "a", "b")])]}),
    );
    await assertFails(updateDoc(ref, {ranking: []}));
    await assertFails(updateDoc(ref, {name: "Altra"}));
    await assertFails(updateDoc(ref, {periods: [], ranking: []}));
  });

  it("il manager modifica tutta la stagione solo se l'ha creata", async () => {
    await assertSucceeds(
      updateDoc(doc(asManager(), "seasons/s1"), {ranking: []}),
    );
    await assertFails(
      updateDoc(doc(asManager("other"), "seasons/s1"), {name: "Altra"}),
    );
  });

  it("l'admin modifica qualsiasi stagione", async () => {
    await assertSucceeds(
      updateDoc(doc(asAdmin(), "seasons/s1"), {ranking: [], name: "X"}),
    );
  });

  it("solo l'admin elimina le stagioni", async () => {
    await assertFails(deleteDoc(doc(asPlayer(), "seasons/s1")));
    await assertFails(deleteDoc(doc(asManager(), "seasons/s1")));
    await assertSucceeds(deleteDoc(doc(asAdmin(), "seasons/s1")));
  });
});

describe("regole: players", () => {
  it("chiunque può leggere i giocatori", async () => {
    await assertSucceeds(getDoc(doc(asGuest(), "players/p1")));
  });

  it("solo gli utenti autenticati creano giocatori", async () => {
    await assertFails(setDoc(doc(asGuest(), "players/p2"), {name: "X"}));
    await assertSucceeds(setDoc(doc(asPlayer(), "players/p2"), {name: "X"}));
  });

  it("modificano il giocatore solo admin, creatore e utente associato", async () => {
    await assertSucceeds(
      updateDoc(doc(asPlayer("u1"), "players/p1"), {phone: "1"}),
    );
    await assertSucceeds(
      updateDoc(doc(asManager(), "players/p1"), {phone: "2"}),
    );
    await assertSucceeds(updateDoc(doc(asAdmin(), "players/p1"), {phone: "3"}));
    await assertFails(
      updateDoc(doc(asPlayer("u2"), "players/p1"), {phone: "4"}),
    );
  });

  it("solo l'admin elimina i giocatori", async () => {
    await assertFails(deleteDoc(doc(asPlayer("u1"), "players/p1")));
    await assertFails(deleteDoc(doc(asManager(), "players/p1")));
    await assertSucceeds(deleteDoc(doc(asAdmin(), "players/p1")));
  });
});

describe("transazioni sulla stagione", () => {
  it("un giocatore lancia una sfida rispettando le regole", async () => {
    await assertSucceeds(
      updateSeasonDoc(asPlayer("a"), "s1", s =>
        addMatchToSeason(s, "a", "b", new Date()),
      ),
    );
    const s = await readSeason();
    expect(Object.values(s.periods![0].matches)).toHaveLength(1);
  });

  it("due sfide contemporanee vengono salvate entrambe", async () => {
    await Promise.all([
      updateSeasonDoc(asPlayer("a"), "s1", s =>
        addMatchToSeason(s, "a", "b", new Date()),
      ),
      updateSeasonDoc(asPlayer("c"), "s1", s =>
        addMatchToSeason(s, "c", "b", new Date()),
      ),
    ]);
    const matches = (await readSeason()).periods![0].matches;
    expect(Object.keys(matches)).toHaveLength(2);
    expect(
      Object.values(matches)
        .map(m => m.pid1)
        .sort(),
    ).toEqual(["a", "c"]);
  });

  it("due approvazioni contemporanee completano la partita", async () => {
    await seed(
      "seasons/s1",
      seasonData({
        periods: [period([match("m", "a", "b", {status: "approved"})])],
      }),
    );
    await Promise.all([
      updateSeasonDoc(asPlayer("a"), "s1", s =>
        approveMatchResult(s, "m", "6-1 6-2", "a"),
      ),
      updateSeasonDoc(asPlayer("b"), "s1", s =>
        approveMatchResult(s, "m", "6-1 6-2", "b"),
      ),
    ]);
    const m = (await readSeason()).periods![0].matches[1];
    expect(m.result).toEqual({
      value: "6-1 6-2",
      p1Approved: true,
      p2Approved: true,
    });
    expect(m.status).toBe("completed");
  });

  it("un errore di validazione annulla la transazione", async () => {
    await expect(
      updateSeasonDoc(asPlayer("a"), "s1", s =>
        addMatchToSeason(s, "a", "a", new Date()),
      ),
    ).rejects.toThrow();
    expect(
      Object.values((await readSeason()).periods![0].matches),
    ).toHaveLength(0);
  });
});
