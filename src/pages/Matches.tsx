import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/material";

export function MatchesPage({sx}: {sx?: SxProps<Theme>}) {
  return <Stack sx={{...sx}}></Stack>;
}
