import type {Theme} from "@emotion/react";
import {Done} from "@mui/icons-material";
import {
  Stack,
  TextField,
  IconButton,
  type SxProps,
  Typography,
} from "@mui/material";
import {WinnerIcon} from "../../../icons";

const ResultRow = ({
  loading,
  matchApproved,
  result,
  error,
  playerIndex,
  canApprove,
  sx,
  canEdit,
  enable3Set,
  winner,
  readonly = false,
  onChangeResult,
  onApprove,
}: {
  readonly: boolean;
  loading: boolean;
  matchApproved: boolean;
  result: (number | null)[][];
  error: boolean[][];
  playerIndex: number;
  canApprove: boolean;
  canEdit: boolean;
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
  const hasError = error[playerIndex].some(e => e);

  if (matchApproved || readonly) {
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
        disabled={loading || !canEdit}
        value={result[playerIndex][0] ?? ""}
        onChange={e => onChangeResult(playerIndex, 0, e.target.value)}
        type="number"
        error={error[playerIndex][0]}
      />
      <TextField
        sx={{...sx}}
        disabled={loading || !canEdit}
        value={result[playerIndex][1] ?? ""}
        onChange={e => onChangeResult(playerIndex, 1, e.target.value)}
        type="number"
        error={error[playerIndex][1]}
      />
      <TextField
        sx={{...sx}}
        disabled={loading || !canEdit || !enable3Set}
        value={result[playerIndex][2] ?? ""}
        onChange={e => onChangeResult(playerIndex, 2, e.target.value)}
        type="number"
        error={error[playerIndex][2]}
      />
      {canApprove && !hasError && (
        <IconButton size="small" disabled={loading} onClick={onApprove}>
          <Done fontSize="inherit" />
        </IconButton>
      )}
    </Stack>
  );
};

export {ResultRow};
