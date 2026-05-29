import type {FieldPath, Timestamp, WhereFilterOp} from "firebase/firestore";

export type role = "admin" | "user";
export type User = {
  id: string;
  displayName: string;
  email: string;
  role: role;
};

export const genderMap: Record<string, string> = {
  male: "Uomo",
  female: "Donna",
  other: "Altro",
};
export type PlayerStatus = "active" | "excluded" | "justified";
export interface Player {
  id: string | undefined;
  userId?: string;
  name?: string;
  surname?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  birthDate?: Timestamp;
  phone?: string;
  email?: string;
  status?: PlayerStatus;
  createdAt?: Timestamp;
}

export interface Season {
  id: string | undefined;
  name: string;
  startDate: Timestamp;
  weeks: number;
  ranking?: Ranking[];
  createdAt: Timestamp;
}

export interface Period {
  id: string | undefined;
  seasonId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
}

export interface Ranking {
  position: number;
  player: Player;
  points: number;
  wins: number;
  losses: number;
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
