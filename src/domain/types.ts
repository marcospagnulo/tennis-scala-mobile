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
};

export const playerStatusMap: Record<string, string> = {
  active: "Attivo",
  excluded: "Escluso",
  unactive: "Non disponibile",
};

export type PlayerStatus = "active" | "unactive";
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
  createdAt?: Timestamp;
}

export interface Season {
  id: string | undefined;
  name: string;
  start: Timestamp;
  end: Timestamp;
  ranking: Ranking[];
  periods: Period[];
  maxMatchesPerPeriod?: number;
  createdAt: Timestamp;
}

export interface Ranking {
  position: number;
  player: Player;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  status: PlayerStatus;
}

export interface Period {
  start: Timestamp;
  end?: Timestamp;
  matches: {[key: number]: Match};
}

export const matchStatusMap: Record<string, string> = {
  pending: "In attesa",
  approved: "Approvata",
  rejected: "Rifiutata",
  completed: "Completata",
};
export interface Match {
  id: string;
  pid1: string;
  pid2: string;
  result?: {
    value: string;
    p1Approved: boolean;
    p2Approved: boolean;
  };
  status: "pending" | "approved" | "rejected" | "completed";
  date: Timestamp;
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
