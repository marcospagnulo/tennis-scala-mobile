import {describe, expect, it} from "vitest";
import {
  addMatchToSeason,
  approveMatchResult,
  nextMatchKey,
  removeMatchFromSeason,
  resetMatchApproval,
  setMatchResult,
  setMatchStatus,
} from "./logic";
import {match, period, season} from "../../test/factories";
import {Timestamp} from "firebase/firestore";

const currentMatches = (s: ReturnType<typeof addMatchToSeason>) =>
  Object.values(s.periods!.find(p => !p.end)!.matches);

describe("nextMatchKey", () => {
  it("parte da 1 e usa la chiave massima + 1", () => {
    expect(nextMatchKey({})).toBe(1);
    expect(
      nextMatchKey({1: match("1", "a", "b"), 3: match("3", "a", "c")}),
    ).toBe(4);
  });
});

describe("addMatchToSeason", () => {
  it("aggiunge la sfida in attesa nel periodo corrente", () => {
    const result = addMatchToSeason(season(), "a", "b", new Date(1000));
    const [m] = currentMatches(result);
    expect(m).toMatchObject({pid1: "a", pid2: "b", status: "pending"});
    expect(m.date.toMillis()).toBe(1000);
  });

  it("crea la sfida già approvata se la inserisce l'admin", () => {
    const [m] = currentMatches(
      addMatchToSeason(season(), "a", "b", new Date(), true),
    );
    expect(m.status).toBe("approved");
    expect(m.result).toMatchObject({p1Approved: true, p2Approved: true});
  });

  it("non sovrascrive una partita esistente dopo una cancellazione", () => {
    // partite con chiavi 1 e 2, poi cancellata la 1: resta solo la chiave 2
    const s = season({
      periods: [
        {start: Timestamp.fromMillis(0), matches: {2: match("m2", "a", "b")}},
      ],
    });
    const matches = currentMatches(addMatchToSeason(s, "a", "c", new Date()));
    expect(matches).toHaveLength(2);
    expect(matches.map(m => m.id)).toContain("m2");
  });

  it("non modifica la stagione ricevuta", () => {
    const s = season();
    const snapshot = structuredClone(s.periods);
    addMatchToSeason(s, "a", "b", new Date());
    expect(Object.keys(s.periods![0].matches)).toHaveLength(0);
    expect(s.periods).toEqual(snapshot);
  });

  it("richiede un periodo aperto", () => {
    const s = season({periods: [period([], Timestamp.fromMillis(1))]});
    expect(() => addMatchToSeason(s, "a", "b", new Date())).toThrow(
      /nuovo periodo/,
    );
  });

  it("impedisce di sfidare se stessi", () => {
    expect(() => addMatchToSeason(season(), "a", "a", new Date())).toThrow();
  });

  it("impedisce due sfide tra gli stessi giocatori nel periodo", () => {
    const s = season({periods: [period([match("1", "b", "a")])]});
    expect(() => addMatchToSeason(s, "a", "b", new Date())).toThrow(
      /stesso avversario/,
    );
  });

  it("consente di nuovo la sfida se la precedente è stata rifiutata", () => {
    const s = season({
      periods: [period([match("1", "a", "b", {status: "rejected"})])],
    });
    expect(
      currentMatches(addMatchToSeason(s, "a", "b", new Date())),
    ).toHaveLength(2);
  });

  it("rispetta il limite di sfide per periodo di entrambi i giocatori", () => {
    const s = season({
      maxMatchesPerPeriod: 1,
      periods: [period([match("1", "a", "c")])],
    });
    expect(() => addMatchToSeason(s, "a", "b", new Date())).toThrow(
      /Hai raggiunto/,
    );
    expect(() => addMatchToSeason(s, "b", "c", new Date())).toThrow(
      /avversario/,
    );
  });
});

describe("approveMatchResult", () => {
  const withMatch = (m = match("m", "a", "b", {status: "approved"})) =>
    season({periods: [period([m])]});
  const get = (r: ReturnType<typeof approveMatchResult>) =>
    r.periods![0].matches[1];

  it("registra l'approvazione del primo giocatore", () => {
    const m = get(approveMatchResult(withMatch(), "m", "6-1 6-2", "a"));
    expect(m.result).toEqual({
      value: "6-1 6-2",
      p1Approved: true,
      p2Approved: false,
    });
    expect(m.status).toBe("approved");
  });

  it("completa la partita quando entrambi approvano lo stesso risultato", () => {
    const s = withMatch(
      match("m", "a", "b", {
        status: "approved",
        result: {value: "6-1 6-2", p1Approved: true, p2Approved: false},
      }),
    );
    const m = get(approveMatchResult(s, "m", "6-1 6-2", "b"));
    expect(m.status).toBe("completed");
  });

  it("annulla l'approvazione dell'avversario se il risultato cambia", () => {
    const s = withMatch(
      match("m", "a", "b", {
        status: "approved",
        result: {value: "6-1 6-2", p1Approved: true, p2Approved: false},
      }),
    );
    const m = get(approveMatchResult(s, "m", "2-6 1-6", "b"));
    expect(m.result).toEqual({
      value: "2-6 1-6",
      p1Approved: false,
      p2Approved: true,
    });
    expect(m.status).toBe("approved");
  });

  it("rifiuta l'approvazione di chi non gioca la partita", () => {
    expect(() =>
      approveMatchResult(withMatch(), "m", "6-1 6-2", "c"),
    ).toThrow();
  });
});

describe("altre operazioni sulle partite", () => {
  const s = season({
    periods: [period([match("m1", "a", "b"), match("m2", "a", "c")])],
  });

  it("setMatchResult con complete forza il completamento", () => {
    const r = setMatchResult(s, "m1", "6-1 6-2", true, true, true);
    expect(r.periods![0].matches[1].status).toBe("completed");
  });

  it("setMatchStatus cambia lo stato", () => {
    expect(
      setMatchStatus(s, "m2", "rejected").periods![0].matches[2].status,
    ).toBe("rejected");
  });

  it("resetMatchApproval azzera le approvazioni mantenendo il risultato", () => {
    const done = season({
      periods: [
        period([
          match("m", "a", "b", {
            status: "completed",
            result: {value: "6-1 6-2", p1Approved: true, p2Approved: true},
          }),
        ]),
      ],
    });
    const m = resetMatchApproval(done, "m").periods![0].matches[1];
    expect(m.status).toBe("approved");
    expect(m.result).toEqual({
      value: "6-1 6-2",
      p1Approved: false,
      p2Approved: false,
    });
  });

  it("removeMatchFromSeason elimina solo la partita indicata", () => {
    const r = removeMatchFromSeason(s, "m1");
    expect(Object.values(r.periods![0].matches).map(m => m.id)).toEqual(["m2"]);
    expect(Object.keys(s.periods![0].matches)).toHaveLength(2);
  });

  it("segnala una partita inesistente", () => {
    expect(() => removeMatchFromSeason(s, "x")).toThrow("Match not found");
    expect(() => setMatchStatus(s, "x", "approved")).toThrow("Match not found");
  });
});
