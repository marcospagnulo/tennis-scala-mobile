import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {PlayerCard} from "./player";
import {CurrentSeasonCard} from "./current-season";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {mobile} = useAppContext();

  return (
    <Stack spacing={2} sx={{...sx, ...(mobile && {px: 2})}}>
      <PlayerCard direction={"column"} />
      <CurrentSeasonCard direction={"column"} />
    </Stack>
  );
}
