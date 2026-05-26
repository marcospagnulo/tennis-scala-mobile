import type {Theme} from "@emotion/react";
import {Box, Grid, Stack, Typography, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import {SeasonPlayers} from "./Ranking";
import {useQueryCollection} from "../../hooks/useQueryCollection";
import {collections} from "../../lib/firebase";
import {Select} from "../../components/Select";

export function DashboardPage({sx}: {sx?: SxProps<Theme>}) {
  const {season, setSeason} = useAppContext();
  const {items: seasons} = useQueryCollection(collections?.seasons);

  const handleSeasonChange = (seasonId: string) => {
    const selectedSeason = seasons.find(s => s.id === seasonId);
    if (selectedSeason) {
      setSeason(selectedSeason);
    }
  };

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
      <Box>
        <Select<string>
          options={seasons.map(season => ({
            label: season.name,
            value: season.id,
          }))}
          value={season.id}
          onChange={handleSeasonChange}
        />
      </Box>
      <Grid container>
        <Grid size={4}>
          <SeasonPlayers season={season} />
        </Grid>
      </Grid>
    </Stack>
  );
}
