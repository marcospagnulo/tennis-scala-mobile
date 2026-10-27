import {doc, getDoc} from "firebase/firestore";
import {collections} from "../../lib/firebase";
import type {Player, Ranking, Season} from "../../domain/types";
import {updateSeason} from "../season";
import {
  addPlayersToRanking,
  closeCurrentPeriod,
  editRankingField,
  openNewPeriod,
  refreshRankingPlayer,
  removeFromRanking,
  swapRankingPositions,
} from "./logic";

const openPeriod = (season: Season) =>
  updateSeason(season.id, s => openNewPeriod(s));

const closePeriod = (season: Season) =>
  updateSeason(season.id, s => closeCurrentPeriod(s));

const swapPositions = (season: Season, pos1: number, pos2: number) =>
  updateSeason(season.id, s => swapRankingPositions(s, pos1, pos2));

const editRanking = (
  season: Season,
  ranking: Ranking,
  field: keyof Ranking,
  value: string | number,
) => updateSeason(season.id, s => editRankingField(s, ranking, field, value));

const addPlayers = (season: Season, players: Player[]) =>
  updateSeason(season.id, s => addPlayersToRanking(s, players));

const deleteRanking = (season: Season, ranking: Ranking) =>
  updateSeason(season.id, s => removeFromRanking(s, ranking));

const refreshRanking = async (season: Season, ranking: Ranking) => {
  if (!collections || !ranking.player.id) return;

  const playerSnap = await getDoc(doc(collections.players, ranking.player.id));
  if (!playerSnap.exists()) {
    await deleteRanking(season, ranking);
    return;
  }

  const playerData = playerSnap.data() as Player;
  await updateSeason(season.id, s =>
    refreshRankingPlayer(s, playerSnap.id, playerData),
  );
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
