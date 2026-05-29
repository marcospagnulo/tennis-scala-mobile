import type {FieldPath, Timestamp, WhereFilterOp} from "firebase/firestore";

export type role = "admin" | "user";
export type User = {
  id: string;
  displayName: string;
  email: string;
  role: role;
};

export type PlayerStatus = "active" | "excluded" | "justified";
export interface Player {
  id?: string;
  userId?: string;
  name?: string;
  surname?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  birthDate?: Timestamp | null;
  phone?: string | null;
  email?: string | null;
  status?: PlayerStatus;
  createdAt?: Timestamp;
}

export interface Season {
  id: string;
  name: string;
  startDate: Timestamp;
  weeks: number;
  createdAt: Timestamp;
}

export interface Period {
  id: string;
  seasonId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
}

export interface Ranking {
  id: string;
  player: Player;
  seasonId: string;
  points: number;
  wins: number;
  losses: number;
  createdAt: Timestamp;
}

export type querySort = {
  field: string | FieldPath;
  direction: "asc" | "desc";
};

export type queryFilter = {
  fieldPath: string | FieldPath;
  opStr: WhereFilterOp;
  value: unknown;
};
