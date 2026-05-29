import {doc, updateDoc} from "firebase/firestore";
import {collections} from "../../lib/firebase";
import type {Player, Ranking, Season} from "../../domain/types";

const recalculatePositions = (ranking: Ranking[]) => {
  return ranking
    .sort((a, b) => b.points - a.points)
    .map((r, index) => ({...r, position: index + 1}));
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

const handleEdit = async (
  season: Season,
  ranking: Ranking,
  field: string,
  value: string | number,
) => {
  if (!collections) return;

  const updatedRanking = {...ranking, [field]: value};
  const updatedSeason = {...season};
  updatedSeason.ranking = updatedSeason.ranking?.map(r =>
    r.player.id === ranking.player.id ? updatedRanking : r,
  );

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const addPlayers = async (season: Season, players: Player[]) => {
  const updatedSeason = {...season};
  const lastPosition = updatedSeason.ranking ? updatedSeason.ranking.length : 0;
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
  }));
  updatedSeason.ranking = [...updatedSeason.ranking, ...ranking];

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

const deletePlayer = async (season: Season, ranking: Ranking) => {
  if (!collections) return;

  const updatedSeason = {...season};
  updatedSeason.ranking =
    updatedSeason.ranking?.filter(r => r.player.id !== ranking.player.id) ?? [];
  updatedSeason.ranking = recalculatePositions(updatedSeason.ranking);

  const seasonDoc = doc(collections!.seasons, season.id);
  await updateDoc(seasonDoc, {
    ...updatedSeason,
  });
};

export {handleEdit, deletePlayer, addPlayers, swapPositions};
