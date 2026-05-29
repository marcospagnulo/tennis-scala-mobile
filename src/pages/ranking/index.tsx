import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  Stack,
  Typography,
  useTheme,
  type SxProps,
} from "@mui/material";
import type {Player, Ranking} from "../../domain/types";
import {Add} from "@mui/icons-material";
import {useAppContext} from "../../app/context";
import type {Theme} from "@emotion/react";
import {RankingRow} from "./row";
import {useEffect, useState} from "react";
import {PlayerList} from "./player-list";
import {RankingHeader} from "./Header";
import {addPlayers, handleEdit} from "./functions";

type groupedPlayersType = {
  1: Ranking[];
  2: Ranking[];
  3: Ranking[];
  4: Ranking[];
};

const RankingPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const theme = useTheme();
  const {user, season} = useAppContext();
  const isAdmin = user?.role === "admin";

  const [dialog, setDialog] = useState(false);
  const [groupedPlayers, setGroupedPlayers] = useState<groupedPlayersType>({
    1: [],
    2: [],
    3: [],
    4: [],
  });

  useEffect(() => {
    if (!season || !season.ranking) return;

    const groupSize =
      season.ranking.length > 4 ? Math.round(season.ranking.length / 4) : 1;
    const newGroupedPlayers: groupedPlayersType = {1: [], 2: [], 3: [], 4: []};
    season.ranking.forEach((player, index) => {
      const group = Math.min(Math.floor(index / groupSize) + 1, 4);
      newGroupedPlayers[group as 1 | 2 | 3 | 4].push(player);
    });
    setGroupedPlayers(newGroupedPlayers);
  }, [season]);

  const handleAddPlayers = async (players: Player[]) => {
    setDialog(false);
    if (!season) return;
    await addPlayers(season, players);
  };

  const getRankingBgColor = (
    index: number,
    length: number,
    groupIndex: number,
  ) => {
    const alternate = groupIndex % 2 === 0;
    const compare = alternate
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a >= b;
    return compare(index, length / 2)
      ? theme.palette.primary.main + "10"
      : theme.palette.primary.main + "20";
  };

  const renderGroup = (group: Ranking[], gindex: number) => {
    if (group.length === 0) return null;
    return (
      <Stack direction={"row"}>
        <Stack
          sx={{minWidth: 30, justifyContent: "center", alignItems: "center"}}>
          <Typography variant="h5">{gindex}</Typography>
        </Stack>
        <Stack sx={{flex: 1}}>
          {group.map((r, index) => (
            <RankingRow
              key={`ranking-${r.position}`}
              ranking={r}
              divider={(index + 1) % group.length === 0 && gindex !== 4}
              onEdit={(field, value) => handleEdit(season!, r, field, value)}
              bgColor={getRankingBgColor(index, group.length, gindex)}
            />
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack sx={{...sx}}>
      <Stack
        sx={{
          gap: 1,
          flex: "1 1 0",
          overflow: "hidden",
        }}
        divider={<Divider />}>
        <Typography variant="h6" gutterBottom align="center">
          Classifica
        </Typography>
        <RankingHeader />
        <Stack
          sx={{
            overflow: "auto",
            flex: "1 1 0",
            mb: 9,
          }}>
          <Stack>{renderGroup(groupedPlayers[1], 1)}</Stack>
          <Stack>{renderGroup(groupedPlayers[2], 2)}</Stack>
          <Stack>{renderGroup(groupedPlayers[3], 3)}</Stack>
          <Stack>{renderGroup(groupedPlayers[4], 4)}</Stack>
        </Stack>
      </Stack>
      {isAdmin && (
        <Fab
          color="primary"
          sx={{position: "absolute", bottom: 16, right: 16}}
          onClick={() => setDialog(true)}>
          <Add />
        </Fab>
      )}
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>Seleziona giocatore</DialogTitle>
        <DialogContent>
          <PlayerList onSelect={handleAddPlayers} sx={{height: "70vh"}} />
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export {RankingPage};
