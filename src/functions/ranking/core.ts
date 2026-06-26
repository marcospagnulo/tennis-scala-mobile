import {doc, getDoc, Timestamp, updateDoc} from "firebase/firestore";
import {collections} from "../../lib/firebase";
import type {Player, Ranking, Season} from "../../domain/types";
import {calculateNewRanking, recalculatePositions} from "../../util";

const openPeriod = async (season: Season) => {
  if (!collections) return;

  const updatedSeason = {...season};

  const currentPeriod = updatedSeason.periods?.find(p => !p.end);
  if (currentPeriod) {
    // Check if all matches in the current period are completed
    Object.entries(currentPeriod.matches).forEach(([, match]) => {
      if (match.status !== "completed") {
        throw new Error(
          "Ci sono partite non completate. Assicurati di approvare o rifiutare tutte le partite prima di chiudere il periodo.",
        );
      }
    });
    currentPeriod.end = new Timestamp(Date.now() / 1000, 0);
  }

  if (!updatedSeason.periods) {
    updatedSeason.periods = [];
  }

  updatedSeason.periods?.push({
    start: new Timestamp(Date.now() / 1000, 0),
    matches: {},
  });

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const closePeriod = async (season: Season) => {
  if (!collections) return;

  const updatedSeason = {...season};
  const currentPeriod = updatedSeason.periods?.find(p => !p.end);
  if (!currentPeriod) {
    throw new Error("Attendi l'inizio di un nuovo periodo");
  }

  Object.entries(currentPeriod.matches).forEach(([, match]) => {
    if (match.status !== "completed") {
      throw new Error(
        "Ci sono partite non completate. Assicurati di approvare o rifiutare tutte le partite prima di chiudere il periodo.",
      );
    }
  });

  // Calculate the matches in the period and update the ranking accordingly
  updatedSeason.ranking = calculateNewRanking(
    currentPeriod,
    updatedSeason.ranking,
  );

  // Close the period and recalculate positions
  currentPeriod.end = new Timestamp(Date.now() / 1000, 0);
  updatedSeason.ranking = recalculatePositions(updatedSeason.ranking);

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const swapPositions = (season: Season, pos1: number, pos2: number) => {
  const index1 = pos1 - 1;
  const index2 = pos2 - 1;
  if (!season.ranking || season.ranking.length <= Math.max(index1, index2))
    return;

  const newRanking = [...season.ranking];
  const temp = newRanking[index1];
  newRanking[index1] = {...newRanking[index2], position: pos1};
  newRanking[index2] = {...temp, position: pos2};

  const updatedSeason = {...season, ranking: newRanking};

  const seasonDoc = doc(collections!.seasons, season.id!);
  return updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const editRanking = async (
  season: Season,
  ranking: Ranking,
  field: keyof Ranking,
  value: string | number,
) => {
  if (!collections) return;

  const updatedRanking = {...ranking, [field]: value};
  const updatedSeason = {...season};
  updatedSeason.ranking = updatedSeason.ranking.map(r =>
    r.player.id === ranking.player.id ? updatedRanking : r,
  );
  updatedSeason.ranking = recalculatePositions(updatedSeason.ranking);

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const addPlayers = async (season: Season, players: Player[]) => {
  const updatedSeason = {...season};
  const lastPosition = updatedSeason.ranking.length;
  let newPlayers = players;
  if (updatedSeason.ranking) {
    //exclude already added players
    const existingPlayerIds = updatedSeason.ranking.map(sp => sp.player.id);
    newPlayers = players.filter(p => !existingPlayerIds.includes(p.id));
  } else {
    updatedSeason.ranking = [];
  }

  const ranking: Ranking[] = newPlayers.map((player, index) => ({
    player: {
      id: player.id,
      name: player.name,
      surname: player.surname,
    } as Player,
    position: lastPosition + index + 1,
    losses: 0,
    wins: 0,
    points: 0,
    draws: 0,
    status: "active",
  }));
  updatedSeason.ranking = [...updatedSeason.ranking, ...ranking];

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const deleteRanking = async (season: Season, ranking: Ranking) => {
  if (!collections) return;

  const updatedSeason = {...season};
  updatedSeason.ranking = updatedSeason.ranking.filter(
    r => r.player.id !== ranking.player.id,
  );
  updatedSeason.ranking = recalculatePositions(updatedSeason.ranking);

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const refreshRanking = async (season: Season, ranking: Ranking) => {
  if (!collections) return;

  const playerRef = doc(collections.players, ranking.player.id);
  const playerSnap = await getDoc(playerRef);

  if (!playerSnap.exists()) {
    deleteRanking(season, ranking);
    return;
  }

  const playerData = playerSnap.data() as Player;
  const updatedRanking = {
    ...ranking,
    player: {
      id: playerData.id,
      name: playerData.name,
      surname: playerData.surname,
    },
  };

  const updatedSeason = {...season};
  updatedSeason.ranking = updatedSeason.ranking.map(r =>
    r.player.id === ranking.player.id ? updatedRanking : r,
  );

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

export {
  closePeriod,
  openPeriod,
  swapPositions,
  editRanking,
  addPlayers,
  deleteRanking,
  refreshRanking,
};
