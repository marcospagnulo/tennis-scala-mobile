import {doc, Timestamp, updateDoc} from "firebase/firestore";
import type {Match, Player, Season} from "../../domain/types";
import {collections} from "../../lib/firebase";

const addChallenge = async (
  season: Season,
  player1: Player,
  player2: Player,
  date: Date,
) => {
  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("No active period found");
  }

  const newMatch: Match = {
    pid1: player1.id!,
    pid2: player2.id!,
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
      (m.pid1 === player1.id && m.pid2 === player2.id) ||
      (m.pid1 === player2.id && m.pid2 === player1.id),
  );
  if (existingMatch) {
    throw new Error(
      "Puoi giocare contro lo stesso avversario solo una volta per periodo. Attendi la fine del periodo corrente per sfidarlo di nuovo.",
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

export {addChallenge};
