import {doc, Timestamp, updateDoc} from "firebase/firestore";
import type {Match, Season} from "../../domain/types";
import {collections} from "../../lib/firebase";

const addMatch = async (
  season: Season,
  player1Id: string,
  player2Id: string,
  date: Date,
) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("No active period found");
  }

  const newMatch: Match = {
    pid1: player1Id!,
    pid2: player2Id!,
    result: {
      value: "",
      p1Approved: false,
      p2Approved: false,
    },
    status: "pending",
    date: new Timestamp(date.getTime() / 1000, 0),
  };

  const matches = Object.values(currentPeriod.matches);

  // verifico che non ci siano già sfide tra questi due giocatori nel periodo corrente
  const existingMatch = matches.find(
    m =>
      (m.pid1 === player1Id && m.pid2 === player2Id) ||
      (m.pid1 === player2Id && m.pid2 === player1Id),
  );
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

const updateMatchResult = async (
  season: Season,
  pid1: string,
  pid2: string,
  result: string,
  p1Approved: boolean,
  p2Approved: boolean,
) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("No active period found");
  }

  currentPeriod.matches = Object.fromEntries(
    Object.entries(currentPeriod.matches).map(([key, match]) => {
      if (
        (match.pid1 === pid1 && match.pid2 === pid2) ||
        (match.pid1 === pid2 && match.pid2 === pid1)
      ) {
        return [
          key,
          {
            ...match,
            status: p1Approved && p2Approved ? "completed" : match.status,
            result: {
              ...match.result,
              value: result,
              p1Approved,
              p2Approved,
            },
          },
        ];
      }
      return [key, match];
    }),
  );

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const updateMatchStatus = async (
  season: Season,
  pid1: string,
  pid2: string,
  status: "approved" | "rejected",
) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("No active period found");
  }

  const approvedMatches = Object.values(currentPeriod.matches).filter(
    m =>
      m.status === "approved" &&
      (m.pid1 === pid1 ||
        m.pid2 === pid1 ||
        m.pid1 === pid2 ||
        m.pid2 === pid2),
  ).length;
  if (
    status === "approved" &&
    approvedMatches >= (season.maxMatchesPerPeriod || 3)
  ) {
    throw new Error(
      `Hai raggiunto il limite di ${season.maxMatchesPerPeriod || 3} sfide per questo periodo. Attendi la fine del periodo corrente per sfidare nuovi avversari.`,
    );
  }

  currentPeriod.matches = Object.fromEntries(
    Object.entries(currentPeriod.matches).map(([key, match]) => {
      if (
        (match.pid1 === pid1 && match.pid2 === pid2) ||
        (match.pid1 === pid2 && match.pid2 === pid1)
      ) {
        return [
          key,
          {
            ...match,
            status,
          },
        ];
      }
      return [key, match];
    }),
  );

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const deleteMatch = (season: Season, playerId1: string, playerId2: string) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("No active period found");
  }

  currentPeriod.matches = Object.fromEntries(
    Object.entries(currentPeriod.matches).filter(([, match]) => {
      return !(
        (match.pid1 === playerId1 && match.pid2 === playerId2) ||
        (match.pid1 === playerId2 && match.pid2 === playerId1)
      );
    }),
  );

  const seasonDoc = doc(collections!.seasons, season.id);
  return updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

export {addMatch, updateMatchResult, updateMatchStatus, deleteMatch};
