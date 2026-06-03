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
      value: [[0, 0]],
      p1Approved: false,
      p2Approved: false,
    },
    challenge: {
      p1Approved: false,
      p2Approved: false,
    },
    status: "pending",
    date: new Timestamp(date.getTime() / 1000, 0),
  };

  currentPeriod.matches.push(newMatch);

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

export {addChallenge};
