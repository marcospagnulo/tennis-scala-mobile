import {Timestamp} from "firebase/firestore";
import type {Period, Player, Ranking, Season} from "../../domain/types";
import {calculateNewRanking, recalculatePositions} from "../../util";

/**
 * Un periodo si può chiudere solo se tutte le partite sono completate o rifiutate.
 */
const assertPeriodClosable = (period: Period) => {
  const openMatch = Object.values(period.matches).find(
    m => m.status !== "completed" && m.status !== "rejected",
  );
  if (openMatch) {
    throw new Error(
      "Ci sono partite non completate. Assicurati di approvare o rifiutare tutte le partite prima di chiudere il periodo.",
    );
  }
};

/**
 * Chiude il periodo corrente sommando alla classifica reale i punti maturati
 * nel periodo. Non modifica la stagione ricevuta.
 */
const closeCurrentPeriod = (
  season: Season,
  now: Date = new Date(),
): Pick<Season, "periods" | "ranking"> => {
  const periods = season.periods ?? [];
  const currentPeriodIndex = periods.findIndex(p => !p.end);
  if (currentPeriodIndex < 0) {
    throw new Error("Attendi l'inizio di un nuovo periodo");
  }
  const currentPeriod = periods[currentPeriodIndex];
  assertPeriodClosable(currentPeriod);

  return {
    ranking: calculateNewRanking(currentPeriod, season.ranking ?? []),
    periods: periods.map((p, index) =>
      index === currentPeriodIndex ? {...p, end: Timestamp.fromDate(now)} : p,
    ),
  };
};

/**
 * Apre un nuovo periodo. Se c'è un periodo aperto viene prima chiuso,
 * aggiornando la classifica con i punti maturati.
 * Non modifica la stagione ricevuta.
 */
const openNewPeriod = (
  season: Season,
  now: Date = new Date(),
): Pick<Season, "periods" | "ranking"> => {
  const closed = season.periods?.some(p => !p.end)
    ? closeCurrentPeriod(season, now)
    : {periods: season.periods ?? [], ranking: season.ranking ?? []};

  return {
    ranking: closed.ranking,
    periods: [
      ...(closed.periods ?? []),
      {start: Timestamp.fromDate(now), matches: {}},
    ],
  };
};

const swapRankingPositions = (
  season: Season,
  pos1: number,
  pos2: number,
): Pick<Season, "ranking"> => {
  const index1 = pos1 - 1;
  const index2 = pos2 - 1;
  const ranking = season.ranking ?? [];
  if (
    Math.min(index1, index2) < 0 ||
    ranking.length <= Math.max(index1, index2)
  )
    throw new Error("Posizione non valida");

  const newRanking = [...ranking];
  newRanking[index1] = {...ranking[index2], position: pos1};
  newRanking[index2] = {...ranking[index1], position: pos2};
  return {ranking: newRanking};
};

const editRankingField = (
  season: Season,
  ranking: Ranking,
  field: keyof Ranking,
  value: string | number,
): Pick<Season, "ranking"> => ({
  ranking: recalculatePositions(
    (season.ranking ?? []).map(r =>
      r.player.id === ranking.player.id ? {...r, [field]: value} : r,
    ),
  ),
});

const addPlayersToRanking = (
  season: Season,
  players: Player[],
): Pick<Season, "ranking"> => {
  const ranking = season.ranking ?? [];
  //exclude already added players
  const existingPlayerIds = ranking.map(r => r.player.id);
  const newPlayers = players.filter(p => !existingPlayerIds.includes(p.id));

  const newRanking: Ranking[] = newPlayers.map((player, index) => ({
    player: {
      id: player.id,
      name: player.name,
      surname: player.surname,
    } as Player,
    position: ranking.length + index + 1,
    losses: 0,
    wins: 0,
    points: 0,
    draws: 0,
    status: "active",
  }));
  return {ranking: [...ranking, ...newRanking]};
};

const removeFromRanking = (
  season: Season,
  ranking: Ranking,
): Pick<Season, "ranking"> => ({
  ranking: recalculatePositions(
    (season.ranking ?? []).filter(r => r.player.id !== ranking.player.id),
  ),
});

/**
 * Aggiorna nome e cognome del giocatore in classifica.
 * L'id viene preso dall'id del documento: il campo `id` non è sempre salvato
 * nei dati del giocatore.
 */
const refreshRankingPlayer = (
  season: Season,
  playerId: string,
  player: Pick<Player, "name" | "surname">,
): Pick<Season, "ranking"> => ({
  ranking: (season.ranking ?? []).map(r =>
    r.player.id === playerId
      ? {
          ...r,
          player: {
            id: playerId,
            name: player.name,
            surname: player.surname,
          },
        }
      : r,
  ),
});

export {
  assertPeriodClosable,
  closeCurrentPeriod,
  openNewPeriod,
  swapRankingPositions,
  editRankingField,
  addPlayersToRanking,
  removeFromRanking,
  refreshRankingPlayer,
};
