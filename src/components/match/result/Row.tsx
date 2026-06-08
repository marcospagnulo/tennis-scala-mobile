import type {Theme} from "@emotion/react";
import {Stack, TextField, type SxProps, Typography} from "@mui/material";
import {WinnerIcon} from "../../../icons";

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
  playerIndex: number;
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
        <Typography variant="body1">{result[playerIndex][0] ?? ""}</Typography>
        <Typography variant="body1">{result[playerIndex][1] ?? ""}</Typography>
        <Typography variant="body1">{result[playerIndex][2] ?? ""}</Typography>
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
