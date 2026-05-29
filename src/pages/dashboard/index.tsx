import type {Theme} from "@emotion/react";
import {Stack, Typography, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {PlayerCard} from "./player";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {season, appLoading} = useAppContext();

  return (
    <Stack sx={{...sx}}>
      <PlayerCard />
      {!season && !appLoading && (
        <Stack
          sx={{...sx, flex: 1, justifyContent: "center", alignItems: "center"}}>
          <Typography variant="h5">Nessuna stagione in corso</Typography>
        </Stack>
      )}
    </Stack>
  );
}
