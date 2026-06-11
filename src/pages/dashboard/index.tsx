import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {MatchesCard} from "./matches";
import {AdminCard} from "./admin";
import {CurrentSeasonCard} from "./current-season";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {mobile} = useAppContext();

  return (
    <Stack spacing={2} sx={{...sx, ...(mobile && {px: 2, pb: 6})}}>
      <AdminCard direction={"column"} />
      <MatchesCard direction={"column"} />
      <CurrentSeasonCard direction={"column"} />
    </Stack>
  );
}
