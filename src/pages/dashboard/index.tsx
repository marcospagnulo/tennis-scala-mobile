import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {MatchesCard} from "./matches";
import {AdminCard} from "./admin";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {mobile} = useAppContext();

  return (
    <Stack spacing={2} sx={{...sx, ...(mobile && {px: 2, mb: 4})}}>
      <AdminCard direction={"column"} />
      <MatchesCard direction={"column"} />
    </Stack>
  );
}
