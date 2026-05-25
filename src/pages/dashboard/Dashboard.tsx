import type {Theme} from "@emotion/react";
import {Stack, Typography, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {season} = useAppContext();

  return (
    <Stack sx={{...sx}}>
      {season ? (
        <Typography>{season.name}</Typography>
      ) : (
        <Stack sx={{flex: 1, justifyContent:"center", alignItems:"center"}}> 
          <Typography variant="h5">Nessuna stagione in corso</Typography>
        </Stack>
      )}
    </Stack>
  );
}
