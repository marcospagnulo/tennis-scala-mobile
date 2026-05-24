import type {Timestamp} from "firebase/firestore";

export type RankingMode = "real" | "live";

export type PlayerStatus = "active" | "excluded" | "justified";

export interface Player {
  id: string;
  name: string;
  surname: string;
  gender: "male" | "female" | "other";
  birthDate: Timestamp | null;
  phone: string | null;
  email: string | null;
  realPoints: number;
  historicalMatches: number;
  previousPeriodOpponentIds: string[];
  status: PlayerStatus;
  irrevocableRefusalsCurrentPeriod: number;
  irrevocableRefusalsTotal: number;
  bookedMatchDates: string[];
  notes?: string;
}

export interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  approximateWeeks: number;
  isCurrent: boolean;
}

export type ChallengeType = "standard" | "irrevocable";

export interface Challenge {
  id: string;
  challengerId: string;
  opponentId: string;
  type: ChallengeType;
  scheduledAt: string;
  location: string;
}

export type MatchOutcome = "completed" | "unfinished" | "draw";

export interface MatchSet {
  homeGames: number;
  awayGames: number;
  note?: string;
}

export interface Match {
  id: string;
  periodId: string;
  challengerId: string;
  homePlayerId: string;
  awayPlayerId: string;
  playedAt: string;
  outcome: MatchOutcome;
  sets: MatchSet[];
  summary: string;
  pointsAwarded: Record<string, number>;
}

export interface RuleConfig {
  targetGroupSize: number;
  adjacentBoundarySize: number;
  approximateWeeksPerPeriod: number;
  minimumMatchesPerPeriod: number;
  minimumMatchesForFinalStage: number;
  minimumRestDaysForIrrevocable: number;
  maxMatchesPerPeriod?: number;
}

export interface LeagueData {
  name: string;
  season: string;
  periods: Period[];
  players: Player[];
  challenges: Challenge[];
  matches: Match[];
  rules: RuleConfig;
}

export interface RankedPlayer extends Player {
  livePoints: number;
  currentPeriodPoints: number;
  currentPeriodMatches: number;
  totalMatches: number;
}

export interface GroupedRanking {
  label: string;
  players: RankedPlayer[];
}

export interface ChallengeValidation {
  challenge: Challenge;
  status: "valid" | "warning" | "invalid";
  reasons: string[];
}
