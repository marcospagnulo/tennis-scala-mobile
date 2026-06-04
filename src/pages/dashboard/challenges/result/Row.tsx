import type {Theme} from "@emotion/react";
import {Done} from "@mui/icons-material";
import {
  Stack,
  TextField,
  IconButton,
  type SxProps,
  Typography,
} from "@mui/material";
import {WinnerIcon} from "../../../../icons";

const ResultRow = ({
  loading,
  matchApproved,
  result,
  error,
  playerIndex,
  canApprove,
  canEdit,
  sx,
  onChangeResult,
  onApprove,
}: {
  loading: boolean;
  matchApproved: boolean;
  result: (number | null)[][];
  error: boolean[][];
  playerIndex: number;
  canApprove: boolean;
  canEdit: boolean;
  sx?: SxProps<Theme>;
  onChangeResult: (
    playerIndex: number,
    setIndex: number,
    value: string,
  ) => void;
  onApprove: () => void;
}) => {
  const wonSet1 = (result[playerIndex][0] ?? 0) >= 6;
  const wonSet2 = (result[playerIndex][1] ?? 0) >= 6;
  const wonSet3 = (result[playerIndex][2] ?? 0) >= 6;
  const winner = wonSet3 || (wonSet1 && wonSet2);

  if (matchApproved) {
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
        disabled={loading || matchApproved || !canEdit}
        value={result[playerIndex][0] ?? ""}
        onChange={e => onChangeResult(playerIndex, 0, e.target.value)}
        type="number"
        error={error[playerIndex][0]}
      />
      <TextField
        sx={{...sx}}
        disabled={loading || matchApproved || !canEdit}
        value={result[playerIndex][1] ?? ""}
        onChange={e => onChangeResult(playerIndex, 1, e.target.value)}
        type="number"
        error={error[playerIndex][1]}
      />
      <TextField
        sx={{...sx}}
        disabled={loading || matchApproved || !canEdit}
        value={result[playerIndex][2] ?? ""}
        onChange={e => onChangeResult(playerIndex, 2, e.target.value)}
        type="number"
        error={error[playerIndex][2]}
      />
      {canApprove && (
        <IconButton size="small" disabled={loading} onClick={onApprove}>
          <Done fontSize="inherit" />
        </IconButton>
      )}
    </Stack>
  );
};

export {ResultRow};
