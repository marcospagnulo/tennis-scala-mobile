import type {Theme} from "@emotion/react";
import {Stack, TextField, type SxProps, Typography} from "@mui/material";
import {WinnerIcon} from "../../../icons";

const SetScore = ({
  result,
  playerIndex,
  setIndex,
}: {
  result: (number | null)[][];
  playerIndex: 0 | 1;
  setIndex: 0 | 1 | 2;
}) => {
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const score = result[playerIndex][setIndex];
  const opponentScore = result[opponentIndex][setIndex];

  return (
    <Typography
      color={
        (score ?? 0) > (opponentScore ?? 0) ? "textPrimary" : "textSecondary"
      }
      sx={{
        fontWeight: (score ?? 0) > (opponentScore ?? 0) ? 500 : 200,
      }}
      variant="body1">
      {score ?? ""}
    </Typography>
  );
};

const ResultRow = ({
  loading,
  result,
  error,
  playerIndex,
  sx,
  edit,
  enable3Set,
  winner,
  onChangeResult,
}: {
  loading: boolean;
  result: (number | null)[][];
  error: boolean[][];
  playerIndex: 0 | 1;
  edit: boolean;
  sx?: SxProps<Theme>;
  enable3Set: boolean;
  winner: boolean;
  onChangeResult: (
    playerIndex: number,
    setIndex: number,
    value: string,
  ) => void;
  onApprove: () => void;
}) => {
  if (!edit) {
    return (
      <Stack direction={"row"} sx={{alignItems: "center", gap: 1, height: 28}}>
        <SetScore result={result} playerIndex={playerIndex} setIndex={0} />
        <SetScore result={result} playerIndex={playerIndex} setIndex={1} />
        {enable3Set && (
          <SetScore result={result} playerIndex={playerIndex} setIndex={2} />
        )}
        {winner && <WinnerIcon color="secondary" />}
      </Stack>
    );
  }

  return (
    <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
      <TextField
        sx={{...sx}}
        disabled={loading}
        value={result[playerIndex][0] ?? ""}
        onChange={e => onChangeResult(playerIndex, 0, e.target.value)}
        type="number"
        error={error[playerIndex][0]}
      />
      <TextField
        sx={{...sx}}
        disabled={loading}
        value={result[playerIndex][1] ?? ""}
        onChange={e => onChangeResult(playerIndex, 1, e.target.value)}
        type="number"
        error={error[playerIndex][1]}
      />
      <TextField
        sx={{...sx}}
        disabled={loading || !enable3Set}
        value={result[playerIndex][2] ?? ""}
        onChange={e => onChangeResult(playerIndex, 2, e.target.value)}
        type="number"
        error={error[playerIndex][2]}
      />
    </Stack>
  );
};

export {ResultRow};
