import {
  Backdrop,
  CircularProgress,
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
import {useAddPlayers} from "../../functions/ranking/useAddPlayers";
import {RankingIcon} from "../../icons";

type groupedPlayersType = {
  1: Ranking[];
  2: Ranking[];
  3: Ranking[];
  4: Ranking[];
};

const RankingPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const theme = useTheme();
  const {user, currentSeason} = useAppContext();
  const isAdmin = user?.role === "admin";

  const {loading, addPlayers} = useAddPlayers();

  const [dialog, setDialog] = useState(false);
  const [groupedPlayers, setGroupedPlayers] = useState<groupedPlayersType>({
    1: [],
    2: [],
    3: [],
    4: [],
  });

  useEffect(() => {
    if (!currentSeason || !currentSeason.ranking) return;

    const groupSize =
      currentSeason.ranking.length > 4
        ? Math.round(currentSeason.ranking.length / 4)
        : 1;
    const newGroupedPlayers: groupedPlayersType = {1: [], 2: [], 3: [], 4: []};
    currentSeason.ranking.forEach((player, index) => {
      const group = Math.min(Math.floor(index / groupSize) + 1, 4);
      newGroupedPlayers[group as 1 | 2 | 3 | 4].push(player);
    });
    setGroupedPlayers(newGroupedPlayers);
  }, [currentSeason]);

  const handleAddPlayers = async (players: Player[]) => {
    setDialog(false);
    if (!currentSeason) return;
    await addPlayers(currentSeason, players);
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
              bgColor={getRankingBgColor(index, group.length, gindex)}
            />
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack sx={{...sx}}>
      {(currentSeason?.ranking.length ?? 0) > 12 ? (
        <Stack
          sx={{
            gap: 1,
            flex: "1 1 0",
            overflow: "hidden",
          }}
          divider={<Divider />}>
          <RankingHeader />
          <Stack
            sx={{
              overflow: "auto",
              flex: "1 1 0",
            }}>
            <Stack>{renderGroup(groupedPlayers[1], 1)}</Stack>
            <Stack>{renderGroup(groupedPlayers[2], 2)}</Stack>
            <Stack>{renderGroup(groupedPlayers[3], 3)}</Stack>
            <Stack>{renderGroup(groupedPlayers[4], 4)}</Stack>
          </Stack>
        </Stack>
      ) : (
        <Stack
          sx={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}>
          <RankingIcon color="primary" sx={{fontSize: 180}} />
          <Typography variant="h5">Classifica non disponibile</Typography>
        </Stack>
      )}
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
      <Backdrop open={loading} sx={{zIndex: theme => theme.zIndex.drawer + 1}}>
        <CircularProgress />
      </Backdrop>
    </Stack>
  );
};

export {RankingPage};
