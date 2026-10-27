import {describe, expect, it} from "vitest";
import {
  CHALLENGER_BONUS,
  calculateNewRanking,
  countSetsWon,
  getWinnerIndex,
  parseResult,
  recalculatePositions,
  shouldEnable3Set,
} from "./util";
import {completed, match, period, ranking} from "./test/factories";

const points = (r: ReturnType<typeof calculateNewRanking>, id: string) =>
  r.find(x => x.player.id === id)!.points;

describe("parseResult", () => {
  it("legge due o tre set", () => {
    expect(parseResult("6-4 3-6 10-8")).toEqual([
      [6, 3, 10],
      [4, 6, 8],
    ]);
    expect(parseResult("6-1 6-2")).toEqual([
      [6, 6, 0],
      [1, 2, 0],
    ]);
  });
});

describe("countSetsWon", () => {
  it("conta i set vinti compreso il super tie-break", () => {
    expect(countSetsWon(parseResult("6-4 3-6 10-8"))).toEqual({p1: 2, p2: 1});
    expect(countSetsWon(parseResult("1-6 2-6"))).toEqual({p1: 0, p2: 2});
  });
});

describe("shouldEnable3Set / getWinnerIndex", () => {
  it("abilita il terzo set solo sull'1-1", () => {
    expect(shouldEnable3Set(parseResult("6-4 3-6"))).toBe(true);
    expect(shouldEnable3Set(parseResult("6-4 6-3"))).toBe(false);
  });

  it("individua il vincitore o la parità", () => {
    expect(getWinnerIndex(parseResult("6-4 6-3"))).toBe(0);
    expect(getWinnerIndex(parseResult("4-6 3-6"))).toBe(1);
    expect(getWinnerIndex(parseResult("6-4 3-6 8-10"))).toBe(1);
    expect(getWinnerIndex(parseResult("6-4 3-6"))).toBe(-1);
  });
});

describe("recalculatePositions", () => {
  it("ordina per punti, vittorie e sconfitte senza modificare l'input", () => {
    const input = [
      {...ranking("a", 1, 3), wins: 1, losses: 1},
      {...ranking("b", 2, 3), wins: 1, losses: 0},
      ranking("c", 3, 5),
      {...ranking("d", 4, 3), wins: 2},
    ];
    const snapshot = structuredClone(input);

    const result = recalculatePositions(input);

    expect(result.map(r => [r.player.id, r.position])).toEqual([
      ["c", 1],
      ["d", 2],
      ["b", 3],
      ["a", 4],
    ]);
    expect(input).toEqual(snapshot);
  });
});

describe("calculateNewRanking", () => {
  const base = [ranking("a", 1), ranking("b", 2)];

  it("vittoria 2-0: 3 punti al vincitore, 0 al perdente, bonus allo sfidante", () => {
    const r = calculateNewRanking(
      period([completed("1", "a", "b", "6-1 6-2")]),
      base,
    );
    expect(points(r, "a")).toBe(3 + CHALLENGER_BONUS);
    expect(points(r, "b")).toBe(0);
  });

  it("vittoria 2-1 dello sfidato: 2 punti al vincitore, 1 + bonus allo sfidante", () => {
    const r = calculateNewRanking(
      period([completed("1", "a", "b", "6-4 3-6 7-10")]),
      base,
    );
    expect(points(r, "b")).toBe(2);
    expect(points(r, "a")).toBe(1 + CHALLENGER_BONUS);
    expect(r[0].player.id).toBe("b");
  });

  it("partita pari: 1 punto a ciascuno, più il bonus allo sfidante", () => {
    const r = calculateNewRanking(
      period([completed("1", "a", "b", "6-4 3-6")]),
      base,
    );
    expect(points(r, "a")).toBe(1 + CHALLENGER_BONUS);
    expect(points(r, "b")).toBe(1);
    expect(r.find(x => x.player.id === "a")!.draws).toBe(1);
  });

  it("il bonus sfidante vale 0,5 punti", () => {
    expect(CHALLENGER_BONUS).toBe(0.5);
  });

  it("ignora le partite non completate", () => {
    const r = calculateNewRanking(
      period([
        match("1", "a", "b", {status: "approved"}),
        match("2", "a", "b", {status: "rejected"}),
      ]),
      base,
    );
    expect(r).toEqual(base);
  });

  it("somma i punti a quelli di partenza e aggiorna vittorie e sconfitte", () => {
    const r = calculateNewRanking(
      period([
        completed("1", "a", "b", "6-1 6-2"),
        completed("2", "b", "a", "6-1 6-2"),
      ]),
      [ranking("a", 1, 10), ranking("b", 2, 4)],
    );
    const a = r.find(x => x.player.id === "a")!;
    expect(a.points).toBe(10 + 3 + CHALLENGER_BONUS);
    expect(a.wins).toBe(1);
    expect(a.losses).toBe(1);
  });

  it("a parità di punti usa lo stesso ordinamento della classifica reale", () => {
    const r = calculateNewRanking(period(), [
      {...ranking("a", 1, 3), wins: 0},
      {...ranking("b", 2, 3), wins: 1},
    ]);
    expect(r.map(x => x.player.id)).toEqual(["b", "a"]);
  });

  it("segnala una partita completata senza risultato", () => {
    const m = match("1", "a", "b", {status: "completed"});
    expect(() => calculateNewRanking(period([m]), base)).toThrow();
  });
});
