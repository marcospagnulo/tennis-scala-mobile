import {Timestamp} from "firebase/firestore";
import type {Match, Period, Player, Ranking, Season} from "../domain/types";

const player = (id: string): Player => ({id, name: id, surname: id});

const ranking = (id: string, position: number, points = 0): Ranking => ({
  player: player(id),
  position,
  points,
  wins: 0,
  losses: 0,
  draws: 0,
  status: "active",
});

const match = (
  id: string,
  pid1: string,
  pid2: string,
  overrides: Partial<Match> = {},
): Match => ({
  id,
  pid1,
  pid2,
  status: "pending",
  result: {value: "", p1Approved: false, p2Approved: false},
  date: Timestamp.fromMillis(0),
  ...overrides,
});

const completed = (
  id: string,
  pid1: string,
  pid2: string,
  value: string,
): Match =>
  match(id, pid1, pid2, {
    status: "completed",
    result: {value, p1Approved: true, p2Approved: true},
  });

const period = (matches: Match[] = [], end?: Timestamp): Period => ({
  start: Timestamp.fromMillis(0),
  ...(end && {end}),
  matches: Object.fromEntries(matches.map((m, i) => [i + 1, m])),
});

const season = (overrides: Partial<Season> = {}): Season => ({
  id: "season",
  name: "Stagione",
  start: Timestamp.fromMillis(0),
  end: Timestamp.fromMillis(0),
  createdAt: Timestamp.fromMillis(0),
  ranking: [ranking("a", 1), ranking("b", 2), ranking("c", 3)],
  periods: [period()],
  ...overrides,
});

export {player, ranking, match, completed, period, season};
