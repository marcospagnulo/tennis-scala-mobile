const shouldEnable3Set = (result: (number | null)[][]): boolean => {
  const gameSet1Player1 = result[0][0] ?? 0;
  const gameSet2Player1 = result[0][1] ?? 0;

  const gameSet1Player2 = result[1][0] ?? 0;
  const gameSet2Player2 = result[1][1] ?? 0;

  const player1WonSet1 = gameSet1Player1 >= gameSet1Player2;
  const player1WonSet2 = gameSet2Player1 >= gameSet2Player2;
  const player2WonSet1 = gameSet1Player2 >= gameSet1Player1;
  const player2WonSet2 = gameSet2Player2 >= gameSet2Player1;
  const enable3Set =
    (player1WonSet1 && player2WonSet2) || (player1WonSet2 && player2WonSet1);

  return enable3Set;
};

const getWinnerIndex = (result: (number | null)[][]): number | null => {
  if (shouldEnable3Set(result)) {
    const gameSet3Player1 = result[0][2] ?? 0;
    const gameSet3Player2 = result[1][2] ?? 0;
    return gameSet3Player1 > gameSet3Player2 ? 0 : 1;
  } else {
    const gameSet1Player1 = result[0][0] ?? 0;
    const gameSet2Player1 = result[0][1] ?? 0;

    const gameSet1Player2 = result[1][0] ?? 0;
    const gameSet2Player2 = result[1][1] ?? 0;

    const player1WonSet1 = gameSet1Player1 >= gameSet1Player2;
    const player1WonSet2 = gameSet2Player1 >= gameSet2Player2;

    const player2WonSet1 = gameSet1Player2 >= gameSet1Player1;
    const player2WonSet2 = gameSet2Player2 >= gameSet2Player1;

    if (player1WonSet1 && player1WonSet2) {
      return 0;
    } else if (player2WonSet1 && player2WonSet2) {
      return 1;
    } else {
      return null;
    }
  }
};

export {shouldEnable3Set, getWinnerIndex};
