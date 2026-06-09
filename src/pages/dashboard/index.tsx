import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {PlayerCard} from "../../components/player";
import {MatchesCard} from "./matches";
import {AdminCard} from "./admin";
import {CurrentSeasonCard} from "./current-season";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {mobile} = useAppContext();

  return (
    <Stack spacing={2} sx={{...sx, ...(mobile && {px: 2})}}>
      <AdminCard direction={"column"} />
      {!mobile && <PlayerCard direction={"column"} />}
      <MatchesCard direction={"column"} />
      <CurrentSeasonCard direction={"column"} />
    </Stack>
  );
}
