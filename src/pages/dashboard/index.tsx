import type {Theme} from "@emotion/react";
import {Grid, Stack, Typography, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {season} = useAppContext();

  if (!season) {
    return (
      <Stack
        sx={{...sx, flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Typography variant="h5">Nessuna stagione in corso</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{...sx}}>
      <Grid container>
        <Grid size={4}></Grid>
      </Grid>
    </Stack>
  );
}
