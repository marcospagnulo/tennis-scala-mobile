import {Stack, type SxProps} from "@mui/material";
import type {Match} from "../../../../domain/types";
import {useEffect, useState} from "react";
import type {Theme} from "@emotion/react";
import {useUpdateChallengeResult} from "../../../../functions/challenge/useUpdateChallengeResult";
import {useAppContext} from "../../../../app/context";
import {ResultRow} from "./Row";

const Result = ({match}: {match: Match}) => {
  const [result, setResult] = useState<(number | null)[][]>([
    [null, null, null],
    [null, null, null],
  ]);
  const [error, setError] = useState<boolean[][]>([
    [false, false, false],
    [false, false, false],
  ]);
  const {currentSeason, player} = useAppContext();

  const {loading, updateChallengeResult} = useUpdateChallengeResult();

  const tfSx: SxProps<Theme> = {
    width: 40,
    "& .MuiInputBase-input": {
      textAlign: "center",
      padding: "2px 0",
    },
  };

  useEffect(() => {
    if (match.result?.value) {
      const sets = match.result.value.split(" ");
      const newResult: (number | null)[][] = [
        [null, null, null],
        [null, null, null],
      ];
      sets.forEach((set, index) => {
        const [p1, p2] = set.split("-");
        newResult[0][index] = parseInt(p1);
        newResult[1][index] = parseInt(p2);
      });
      setResult(newResult);
    } else {
      setResult([
        [null, null, null],
        [null, null, null],
      ]);
    }
  }, [match.result]);

  const validateSet = (p1: number | null, p2: number | null): boolean => {
    // controllo che i punteggi siano non negativi
    if (p1 === null || p2 === null) return false;
    if (p1 < 0 || p2 < 0) return false;
    // controllo che non ci siano parziali
    if (p1 === p2) return false;

    const winnerGames = Math.max(p1, p2);
    const loserGames = Math.min(p1, p2);

    // Un set standard termina 6-0..6-4, 7-5 oppure 7-6.
    if (winnerGames === 6) {
      return loserGames <= 4;
    }

    if (winnerGames === 7) {
      return loserGames === 5 || loserGames === 6;
    }

    return false;
  };

  const handleChangeResult = (
    playerIndex: number,
    setIndex: number,
    value: string,
  ) => {
    const newResult = [...result];
    newResult[playerIndex][setIndex] = parseInt(value) || 0;
    setResult(newResult);
    if (!validateSet(newResult[0][setIndex], newResult[1][setIndex])) {
      const newError = [...error];
      newError[0][setIndex] = true;
      newError[1][setIndex] = true;
      setError(newError);
    } else {
      const newError = [...error];
      newError[0][setIndex] = false;
      newError[1][setIndex] = false;
      setError(newError);
    }
  };

  const handleApprove = async () => {
    const pid = player!.id!;
    let resultString = `${result[0][0]}-${result[0][1]} ${result[1][0] ?? 0}-${result[1][1] ?? 0}`;
    if (result[0][2] !== null && result[1][2] !== null) {
      resultString += ` ${result[0][2]}-${result[1][2]}`;
    }
    const pid1Approved =
      pid === match.pid1 ? true : match.result?.p1Approved || false;
    const pid2Approved =
      pid === match.pid2 ? true : match.result?.p2Approved || false;
    await updateChallengeResult(
      currentSeason!,
      match.pid1,
      match.pid2,
      resultString,
      pid1Approved,
      pid2Approved,
    );
  };

  const p1Approved = match.result?.p1Approved ?? false;
  const p2Approved = match.result?.p2Approved ?? false;
  const matchApproved = p1Approved && p2Approved;
  const canP1Approve =
    match.pid1 === player?.id && !p1Approved && !matchApproved;
  const canP2Approve =
    match.pid2 === player?.id && !p2Approved && !matchApproved;
  const canEdit = player?.id === match.pid1 || player?.id === match.pid2;

  return (
    <Stack sx={{gap: 1, flex: 1}}>
      <ResultRow
        loading={loading}
        matchApproved={matchApproved}
        result={result}
        error={error}
        playerIndex={0}
        canApprove={canP1Approve}
        canEdit={canEdit}
        sx={tfSx}
        onChangeResult={handleChangeResult}
        onApprove={handleApprove}
      />
      <ResultRow
        loading={loading}
        matchApproved={matchApproved}
        result={result}
        error={error}
        playerIndex={1}
        canApprove={canP2Approve}
        canEdit={canEdit}
        sx={tfSx}
        onChangeResult={handleChangeResult}
        onApprove={handleApprove}
      />
    </Stack>
  );
};

export {Result};
