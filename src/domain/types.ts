import type {Timestamp} from "firebase/firestore";

export type role = "admin" | "user";
export type User = {
  displayName: string;
  email: string;
  role: role;
};

export type PlayerStatus = "active" | "excluded" | "justified";
export interface Player {
  id: string;
  name: string;
  surname: string;
  avatar?: string;
  gender: "male" | "female" | "other";
  birthDate: Timestamp | null;
  phone: string | null;
  email: string | null;
  status: PlayerStatus;
}

export interface Season {
  id: string;
  name: string;
  startDate: Timestamp;
  weeks: number;
}

export interface Period {
  id: string;
  seasonId: string;
  startDate: Timestamp;
  endDate: Timestamp;
}

export interface Ranking {
  id: string;
  playerId: string;
  periodId: string;
  points: number;
}
