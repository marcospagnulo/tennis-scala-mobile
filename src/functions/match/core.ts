import {doc, Timestamp, updateDoc} from "firebase/firestore";
import type {Match, Season} from "../../domain/types";
import {collections} from "../../lib/firebase";

const findMatchById = (season: Season, mId: string): Match | undefined => {
  const periods = season.periods ?? [];
  for (const period of periods) {
    const matches = Object.values(period.matches);
    const match = matches.find(m => m.id === mId);
    if (match) {
      return match;
    }
  }
  return undefined;
};

const deleteMatchById = (season: Season, mId: string): Match | undefined => {
  const periods = season.periods ?? [];
  for (const period of periods) {
    const matchKey: number | undefined = Object.keys(period.matches).find(
      key => period.matches[key as unknown as number].id === mId,
    ) as unknown as number | undefined;
    if (matchKey !== undefined) {
      const match = period.matches[matchKey];
      delete period.matches[matchKey];
      return match;
    }
  }
  return undefined;
};

const addMatch = async (
  season: Season,
  player1Id: string,
  player2Id: string,
  date: Date,
  admin?: boolean,
) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods?.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("Attendi l'inizio di un nuovo periodo");
  }

  const newMatch: Match = {
    id: `${Date.now()}`,
    pid1: player1Id!,
    pid2: player2Id!,
    result: {
      value: "",
      p1Approved: admin ?? false,
      p2Approved: admin ?? false,
    },
    status: admin ? "approved" : "pending",
    date: new Timestamp(date.getTime() / 1000, 0),
  };

  const matches = Object.values(currentPeriod.matches);

  // verifico che non ci siano già sfide tra questi due giocatori nel periodo corrente
  const existingMatch = matches.find(m => {
    const samePlayer =
      (m.pid1 === player1Id && m.pid2 === player2Id) ||
      (m.pid1 === player2Id && m.pid2 === player1Id);
    return samePlayer && m.status !== "rejected";
  });
  if (existingMatch) {
    throw new Error(
      "Puoi giocare contro lo stesso avversario solo una volta per periodo. Attendi la fine del periodo corrente per sfidarlo di nuovo.",
    );
  }

  // verifico che i giocatori non abbiamo sforato il limite di sfide per periodo
  const maxChallenges = season.maxMatchesPerPeriod || 3;
  const player1Matches = matches.filter(
    m =>
      m.status !== "rejected" && (m.pid1 === player1Id || m.pid2 === player1Id),
  );
  const player2Matches = matches.filter(
    m =>
      m.status !== "rejected" && (m.pid1 === player2Id || m.pid2 === player2Id),
  );
  if (player1Matches.length >= maxChallenges) {
    throw new Error(
      `Hai raggiunto il limite di ${maxChallenges} sfide per questo periodo. Attendi la fine del periodo corrente per sfidare nuovi avversari.`,
    );
  }
  if (player2Matches.length >= maxChallenges) {
    throw new Error(
      `Il tuo avversario ha raggiunto il limite di ${maxChallenges} sfide per questo periodo. Attendi la fine del periodo corrente per sfidarlo di nuovo.`,
    );
  }

  currentPeriod.matches = {
    ...currentPeriod.matches,
    [Object.keys(currentPeriod.matches).length + 1]: newMatch,
  };

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const resetMatchApproval = async (season: Season, mId: string) => {
  const updatedSeason = {...season};

  const match = findMatchById(season, mId);
  if (!match) {
    throw new Error("Match not found");
  }
  match.status = "approved";
  match.result = {
    value: match.result?.value || "",
    p1Approved: false,
    p2Approved: false,
  };

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const updateMatchResult = async (
  season: Season,
  mId: string,
  result: string,
  p1Approved: boolean,
  p2Approved: boolean,
  complete?: boolean,
) => {
  const updatedSeason = {...season};

  const match = findMatchById(season, mId);
  if (!match) {
    throw new Error("Match not found");
  }

  match.status = complete
    ? "completed"
    : p1Approved && p2Approved
      ? "completed"
      : match.status;

  match.result = {
    value: result,
    p1Approved,
    p2Approved,
  };

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const updateMatchStatus = async (
  season: Season,
  mId: string,
  status: "approved" | "rejected",
) => {
  const updatedSeason = {...season};

  const match = findMatchById(season, mId);
  if (!match) {
    throw new Error("Match not found");
  }

  match.status = status;

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const updateMatchDate = async (season: Season, mId: string, date: Date) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods?.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("Attendi l'inizio di un nuovo periodo");
  }

  const match = findMatchById(season, mId);
  if (match) {
    match.date = new Timestamp(date.getTime() / 1000, 0);
  }

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const deleteMatch = (season: Season, mId: string) => {
  const updatedSeason = {...season};

  const match = deleteMatchById(season, mId);
  if (!match) {
    throw new Error("Match not found");
  }

  const seasonDoc = doc(collections!.seasons, season.id);
  return updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

export {
  addMatch,
  updateMatchResult,
  updateMatchStatus,
  deleteMatch,
  resetMatchApproval,
  updateMatchDate,
};
