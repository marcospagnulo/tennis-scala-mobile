import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {PlayerCard} from "./player";
import {ChallengesCard} from "./challenges";
import {AdminCard} from "./admin";
import {CurrentSeasonCard} from "./current-season";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {mobile} = useAppContext();

  return (
    <Stack spacing={2} sx={{...sx, ...(mobile && {px: 2})}}>
      <AdminCard direction={"column"} />
      <PlayerCard direction={"column"} />
      <ChallengesCard direction={"column"} />
      <CurrentSeasonCard direction={"column"} />
    </Stack>
  );
}
