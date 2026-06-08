import type {Period, Ranking} from "./domain/types";

/**
 * Ricalcola le posizioni in base ai punti, numero di vittorie e di partite
 *
 * @param ranking
 * @returns ranking con posizioni ricalcolate
 */
const recalculatePositions = (ranking: Ranking[]) => {
  return ranking
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points; // Ordina per punti
      } else if (b.wins !== a.wins) {
        return b.wins - a.wins; // Se i punti sono uguali, ordina per vittorie
      } else {
        return a.losses - b.losses; // Se anche le vittorie sono uguali, ordina per sconfitte (meno è meglio)
      }
    })
    .map((r, index) => ({...r, position: index + 1}));
};

/**
 * Calculate the matches in a given period and update the ranking accordingly.
 *
 * @param period The period for which to calculate the matches.
 * @param ranking The current ranking of players.
 * @returns The updated ranking after calculating the matches in the period.
 */
const calculateNewRanking = (period: Period, ranking: Ranking[]): Ranking[] => {
  const periodRanking: Record<string, Ranking> = {};

  Object.values(period.matches)
    .filter(m => m.status === "completed")
    .forEach(match => {
      if (!match.result?.value) {
        throw new Error(
          "Match completed without result value" +
            match.pid1 +
            " vs " +
            match.pid2,
        );
      }

      const score = parseResult(match.result.value);
      const sets = countSetsWon(score);
      const p1 = ranking.find(r => r.player.id === match.pid1);
      const p2 = ranking.find(r => r.player.id === match.pid2);
      if (!p1 || !p2) {
        console.error("Players not found in ranking for match", match);
        return;
      }

      if (!periodRanking[match.pid1]) {
        periodRanking[match.pid1] = {
          ...p1,
          points: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        };
      }
      const player1 = periodRanking[match.pid1];
      if (!periodRanking[match.pid2]) {
        periodRanking[match.pid2] = {
          ...p2,
          points: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        };
      }
      const player2 = periodRanking[match.pid2];

      player1.points += 1; // Assegna 1 punto per aver sfidato
      if (sets.p1 > sets.p2) {
        player1.wins += 1;
        player2.losses += 1;
        player1.points += sets.p1 - sets.p2 === 2 ? 3 : 2; // Assegna 3 punti per vittoria 2-0, 2 punti per vittoria 2-1
        player2.points += sets.p1 - sets.p2 === 2 ? 0 : 1; // Assegna 1 punto per sconfitta 1-2, 0 punti per sconfitta 0-2
      } else if (sets.p2 > sets.p1) {
        player2.wins += 1;
        player1.losses += 1;
        player2.points += sets.p2 - sets.p1 === 2 ? 3 : 2; // Assegna 3 punti per vittoria 2-0, 2 punti per vittoria 2-1
        player1.points += sets.p2 - sets.p1 === 2 ? 0 : 1; // Assegna 1 punto per sconfitta 1-2, 0 punti per sconfitta 0-2
      } else {
        player1.draws += 1;
        player2.draws += 1;
        player1.points += 1; // Assegna 1 punto per il pareggio
        player2.points += 1; // Assegna 1 punto per il pareggio
      }
    });

  ranking = ranking
    .map(r => {
      const periodPlayer = periodRanking[r.player.id!];
      if (periodPlayer) {
        return {
          ...r,
          points: r.points + periodPlayer.points,
          wins: r.wins + periodPlayer.wins,
          losses: r.losses + periodPlayer.losses,
          draws: r.draws + periodPlayer.draws,
        };
      }
      return r;
    })
    .sort((a, b) => b.points - a.points)
    .map((r, index) => ({...r, position: index + 1}));

  return ranking;
};

const parseResult = (value: string): number[][] => {
  const sets = value.split(" ");
  const newResult: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
  ];
  sets.forEach((set, index) => {
    const [p1, p2] = set.split("-");
    newResult[0][index] = parseInt(p1);
    newResult[1][index] = parseInt(p2);
  });

  return newResult;
};

const countSetsWon = (result: number[][]): {p1: number; p2: number} => {
  let player1SetsWon = 0;
  let player2SetsWon = 0;

  for (let i = 0; i < result[0].length; i++) {
    const gameSet1Player1 = result[0][i] ?? 0;
    const gameSet1Player2 = result[1][i] ?? 0;

    if (gameSet1Player1 > gameSet1Player2) {
      player1SetsWon++;
    } else if (gameSet1Player2 > gameSet1Player1) {
      player2SetsWon++;
    }
  }

  return {p1: player1SetsWon, p2: player2SetsWon};
};

const shouldEnable3Set = (result: (number | null)[][]): boolean => {
  const gameSet1Player1 = result[0][0] ?? 0;
  const gameSet2Player1 = result[0][1] ?? 0;

  const gameSet1Player2 = result[1][0] ?? 0;
  const gameSet2Player2 = result[1][1] ?? 0;

  const player1WonSet1 = gameSet1Player1 > gameSet1Player2;
  const player1WonSet2 = gameSet2Player1 > gameSet2Player2;
  const player2WonSet1 = gameSet1Player2 > gameSet1Player1;
  const player2WonSet2 = gameSet2Player2 > gameSet2Player1;
  const enable3Set =
    (player1WonSet1 && player2WonSet2) || (player1WonSet2 && player2WonSet1);

  return enable3Set;
};

const getWinnerIndex = (result: (number | null)[][]): number | null => {
  if (shouldEnable3Set(result)) {
    const gameSet3Player1 = result[0][2] ?? 0;
    const gameSet3Player2 = result[1][2] ?? 0;
    if (gameSet3Player1 === gameSet3Player2) {
      return -1;
    }
    return gameSet3Player1 > gameSet3Player2 ? 0 : 1;
  } else {
    const gameSet1Player1 = result[0][0] ?? 0;
    const gameSet2Player1 = result[0][1] ?? 0;

    const gameSet1Player2 = result[1][0] ?? 0;
    const gameSet2Player2 = result[1][1] ?? 0;

    const player1WonSet1 = gameSet1Player1 > gameSet1Player2;
    const player1WonSet2 = gameSet2Player1 > gameSet2Player2;

    const player2WonSet1 = gameSet1Player2 > gameSet1Player1;
    const player2WonSet2 = gameSet2Player2 > gameSet2Player1;

    if (player1WonSet1 && player1WonSet2) {
      return 0;
    } else if (player2WonSet1 && player2WonSet2) {
      return 1;
    } else {
      return -1;
    }
  }
};

export {
  calculateNewRanking,
  parseResult,
  countSetsWon,
  shouldEnable3Set,
  getWinnerIndex,
  recalculatePositions,
};
