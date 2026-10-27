import {describe, expect, it} from "vitest";
import {Timestamp} from "firebase/firestore";
import {
  addPlayersToRanking,
  closeCurrentPeriod,
  editRankingField,
  openNewPeriod,
  refreshRankingPlayer,
  removeFromRanking,
  swapRankingPositions,
} from "./logic";
import {
  completed,
  match,
  period,
  player,
  ranking,
  season,
} from "../../test/factories";
import type {Season} from "../../domain/types";

const now = new Date(5000);

describe("closeCurrentPeriod", () => {
  it("chiude il periodo e aggiorna la classifica reale", () => {
    const s = season({
      periods: [period([completed("1", "c", "a", "6-1 6-2")])],
    });
    const r = closeCurrentPeriod(s, now);
    expect(r.periods![0].end!.toMillis()).toBe(5000);
    expect(r.ranking[0].player.id).toBe("c");
    expect(r.ranking[0].points).toBe(3.5);
    expect(s.periods![0].end).toBeUndefined();
  });

  it("consente la chiusura con partite rifiutate", () => {
    const s = season({
      periods: [period([match("1", "a", "b", {status: "rejected"})])],
    });
    expect(() => closeCurrentPeriod(s, now)).not.toThrow();
  });

  it.each(["pending", "approved"] as const)(
    "blocca la chiusura con partite %s",
    status => {
      const s = season({periods: [period([match("1", "a", "b", {status})])]});
      expect(() => closeCurrentPeriod(s, now)).toThrow(/non completate/);
    },
  );

  it("richiede un periodo aperto", () => {
    const s = season({periods: [period([], Timestamp.fromMillis(1))]});
    expect(() => closeCurrentPeriod(s, now)).toThrow();
  });
});

describe("openNewPeriod", () => {
  it("apre il primo periodo di una stagione senza periodi", () => {
    const r = openNewPeriod(season({periods: undefined}), now);
    expect(r.periods).toHaveLength(1);
    expect(r.periods![0]).toEqual({
      start: Timestamp.fromDate(now),
      matches: {},
    });
  });

  it("chiude il periodo aperto conteggiando i punti prima di aprirne uno nuovo", () => {
    const s = season({
      periods: [period([completed("1", "b", "a", "6-1 6-2")])],
    });
    const r = openNewPeriod(s, now);
    expect(r.periods).toHaveLength(2);
    expect(r.periods![0].end!.toMillis()).toBe(5000);
    expect(r.periods![1].end).toBeUndefined();
    expect(r.ranking.find(x => x.player.id === "b")!.points).toBe(3.5);
  });

  it("non apre un nuovo periodo se quello aperto ha partite da completare", () => {
    const s = season({periods: [period([match("1", "a", "b")])]});
    expect(() => openNewPeriod(s, now)).toThrow(/non completate/);
  });
});

describe("operazioni sulla classifica", () => {
  it("swapRankingPositions scambia due posizioni", () => {
    const r = swapRankingPositions(season(), 1, 3);
    expect(r.ranking.map(x => [x.player.id, x.position])).toEqual([
      ["c", 1],
      ["b", 2],
      ["a", 3],
    ]);
  });

  it("swapRankingPositions rifiuta posizioni non valide", () => {
    expect(() => swapRankingPositions(season(), 0, 2)).toThrow();
    expect(() => swapRankingPositions(season(), 1, 9)).toThrow();
  });

  it("editRankingField modifica il campo e riordina", () => {
    const s = season();
    const r = editRankingField(s, s.ranking[2], "points", 2.5);
    expect(r.ranking[0]).toMatchObject({position: 1, points: 2.5});
    expect(r.ranking[0].player.id).toBe("c");
  });

  it("addPlayersToRanking aggiunge in coda ignorando i duplicati", () => {
    const r = addPlayersToRanking(season(), [player("a"), player("d")]);
    expect(r.ranking.map(x => [x.player.id, x.position])).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ]);
  });

  it("addPlayersToRanking funziona anche senza classifica", () => {
    const s = season({ranking: undefined} as unknown as Partial<Season>);
    expect(addPlayersToRanking(s, [player("a")]).ranking).toHaveLength(1);
  });

  it("removeFromRanking rimuove e ricalcola le posizioni", () => {
    const s = season();
    const r = removeFromRanking(s, s.ranking[0]);
    expect(r.ranking.map(x => [x.player.id, x.position])).toEqual([
      ["b", 1],
      ["c", 2],
    ]);
  });

  it("refreshRankingPlayer usa l'id del documento", () => {
    const s = season({ranking: [ranking("a", 1, 4)]});
    const r = refreshRankingPlayer(s, "a", {name: "Mario", surname: "Rossi"});
    expect(r.ranking[0].player).toEqual({
      id: "a",
      name: "Mario",
      surname: "Rossi",
    });
    expect(r.ranking[0].points).toBe(4);
  });
});
