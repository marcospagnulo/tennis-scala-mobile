import {IconButton, Stack, type SxProps} from "@mui/material";
import {useEffect, useState} from "react";
import type {Theme} from "@emotion/react";
import {ResultRow} from "./Row";
import type {Match} from "../../../domain/types";
import {useAppContext} from "../../../app/context";
import {useUpdateMatchResult} from "../../../functions/match/useUpdateMatchResult";
import {getWinnerIndex, shouldEnable3Set} from "../../../util";
import {Done} from "@mui/icons-material";
import {EditIcon} from "../../../icons";
import {ConfirmDialog} from "../../ConfirmDialog";
import {Admin} from "../../Admin";

const Result = ({match, expired}: {match: Match; expired: boolean}) => {
  const {currentSeason, player, user} = useAppContext();
  const isAdmin = user?.role === "admin";

  const [enable3Set, setEnable3Set] = useState<boolean>(false);
  const [result, setResult] = useState<(number | null)[][]>([
    [null, null, null],
    [null, null, null],
  ]);
  const [error, setError] = useState<boolean[][]>([
    [false, false, false],
    [false, false, false],
  ]);

  const {loading, updateMatchResult, resetMatchApproval} =
    useUpdateMatchResult();

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
      setEnable3Set(shouldEnable3Set(newResult));
    } else {
      setResult([
        [null, null, null],
        [null, null, null],
      ]);
    }
  }, [match.result]);

  const validateSuperTieBreak = (
    p1: number | null,
    p2: number | null,
  ): boolean => {
    if (p1 === null || p2 === null) return false;
    if (p1 < 0 || p2 < 0) return false;
    if (p1 === p2) return false;

    const winnerPoints = Math.max(p1, p2);
    const loserPoints = Math.min(p1, p2);

    // Un tie-break termina a 10 oppure prosegue fino a quando un giocatore non ha almeno 2 punti di vantaggio
    if (winnerPoints < 10) return false;
    if (winnerPoints === 10) {
      return loserPoints <= 8;
    }
    return winnerPoints - loserPoints >= 2;
  };

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
    const validatSet = setIndex < 2 ? validateSet : validateSuperTieBreak;
    if (!validatSet(newResult[0][setIndex], newResult[1][setIndex])) {
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

    // se il 3° set non è abilitato, resetto eventuali errori e punteggi inseriti
    const enabled = shouldEnable3Set(result);
    if (!enabled) {
      const newResult = [...result];
      newResult[0][2] = null;
      newResult[1][2] = null;
      setResult(newResult);
      const newError = [...error];
      newError[0][2] = false;
      newError[1][2] = false;
      setError(newError);
    }
    setEnable3Set(enabled);
  };

  const handleApprove = async () => {
    const pid = player!.id!;
    let resultString = `${result[0][0]}-${result[1][0]} ${result[0][1] ?? 0}-${result[1][1] ?? 0}`;
    if (result[0][2] !== null && result[1][2] !== null) {
      resultString += ` ${result[0][2]}-${result[1][2]}`;
    }
    const pid1Approved =
      pid === match.pid1 ? true : match.result?.p1Approved || false;
    const pid2Approved =
      pid === match.pid2 ? true : match.result?.p2Approved || false;
    await updateMatchResult(
      currentSeason!,
      match.id,
      resultString,
      pid1Approved,
      pid2Approved,
    );
  };

  const handleAdminApprove = async () => {
    let resultString = `${result[0][0]}-${result[1][0]} ${result[0][1] ?? 0}-${result[1][1] ?? 0}`;
    if (result[0][2] !== null && result[1][2] !== null) {
      resultString += ` ${result[0][2]}-${result[1][2]}`;
    }

    await updateMatchResult(
      currentSeason!,
      match.id,
      resultString,
      true,
      true,
      true,
    );
    setEditResult(false);
  };

  const hasError = error.some(row => row.some(e => e));

  const isCurrentPlayerP1 = match.pid1 === player?.id;
  const isCurrentPlayerP2 = match.pid2 === player?.id;
  const canP1Approve = isCurrentPlayerP1 && !match.result?.p1Approved;
  const canP2Approve = isCurrentPlayerP2 && !match.result?.p2Approved;
  const canApprove = canP1Approve || canP2Approve;
  const canEdit =
    ((isCurrentPlayerP1 && match.result?.p1Approved) ||
      (isCurrentPlayerP2 && match.result?.p2Approved)) ??
    false;

  const [confirmEditDialog, setConfirmEditDialog] = useState<boolean>(false);
  const [editResult, setEditResult] = useState<boolean>(false);

  useEffect(() => {
    setEditResult(canApprove);
  }, [canApprove]);

  const handleConfirmEdit = async () => {
    setConfirmEditDialog(false);
    await resetMatchApproval(currentSeason!, match.id);
    setEditResult(true);
  };

  const winnerIndex = getWinnerIndex(result);
  return (
    <Stack direction={"row"} sx={{gap: 1, flex: 1, alignItems: "center"}}>
      <Stack sx={{gap: 1}}>
        <ResultRow
          loading={loading}
          result={result}
          error={error}
          playerIndex={0}
          edit={editResult}
          sx={tfSx}
          enable3Set={enable3Set}
          winner={winnerIndex === 0}
          onChangeResult={handleChangeResult}
          onApprove={handleApprove}
        />
        <ResultRow
          loading={loading}
          result={result}
          error={error}
          playerIndex={1}
          edit={editResult}
          sx={tfSx}
          enable3Set={enable3Set}
          winner={winnerIndex === 1}
          onChangeResult={handleChangeResult}
          onApprove={handleApprove}
        />
      </Stack>

      {!isAdmin && canEdit && !expired && (
        <IconButton
          size="small"
          disabled={loading}
          onClick={() => setConfirmEditDialog(true)}>
          <EditIcon fontSize="inherit" />
        </IconButton>
      )}

      {!isAdmin && canApprove && (
        <IconButton
          size="small"
          disabled={loading || hasError}
          onClick={handleApprove}>
          <Done fontSize="inherit" />
        </IconButton>
      )}

      <Admin>
        {!editResult ? (
          <IconButton
            sx={{bgcolor: "primary.main"}}
            size="small"
            disabled={loading}
            onClick={() => setEditResult(true)}>
            <EditIcon fontSize="inherit" color="secondary" />
          </IconButton>
        ) : (
          <IconButton
            sx={{bgcolor: "primary.main"}}
            size="small"
            disabled={loading || hasError}
            onClick={handleAdminApprove}>
            <Done fontSize="inherit" color="secondary" />
          </IconButton>
        )}
      </Admin>

      <ConfirmDialog
        open={confirmEditDialog}
        onClose={() => setConfirmEditDialog(false)}
        onConfirm={handleConfirmEdit}
        title="Conferma modifica"
        content="Sei sicuro di voler modificare il risultato? L'avversario dovrà approvare nuovamente il risultato."
      />
    </Stack>
  );
};

export {Result};
