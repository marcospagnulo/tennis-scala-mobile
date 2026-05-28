import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  Stack,
  Typography,
  useTheme,
  type SxProps,
} from "@mui/material";
import {collections} from "../../lib/firebase";
import type {Player, queryFilter, querySort, Ranking} from "../../domain/types";
import {Add, Refresh} from "@mui/icons-material";
import {useAppContext} from "../../app/context";
import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {useLiveCollection} from "../../hooks/useLiveCollection";
import type {Theme} from "@emotion/react";
import {DeleteIcon} from "../../icons";
import {RankingRow} from "./row";
import {useEffect, useState} from "react";
import {PlayerList} from "./player-list";
import {RankingHeader} from "./Header";

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
  const [filters, setFilters] = useState<queryFilter[]>([]);
  const [sort] = useState<querySort[]>([
    {field: "points", direction: "desc"},
    {field: "wins", direction: "desc"},
    {field: "losses", direction: "asc"},
    {field: "player.surname", direction: "asc"},
  ]);

  const {items: seasonPlayers, loading: seasonPlayersLoading} =
    useLiveCollection({
      collection: collections?.ranking,
      filters: filters,
      sort: sort,
      skip: !season,
    });

  useEffect(() => {
    if (!season) return;
    setFilters([{fieldPath: "seasonId", opStr: "==", value: season.id}]);
  }, [season]);
  useEffect(() => {
    const groupSize = Math.round(seasonPlayers.length / 4);
    const newGroupedPlayers: groupedPlayersType = {1: [], 2: [], 3: [], 4: []};
    seasonPlayers.forEach((player, index) => {
      const group = Math.min(Math.floor(index / groupSize) + 1, 4);
      newGroupedPlayers[group as 1 | 2 | 3 | 4].push(player);
    });
    setGroupedPlayers(newGroupedPlayers);
  }, [seasonPlayers]);

  const handleAddPlayers = async (players: Player[]) => {
    setDialog(false);
    if (!collections) return;

    //exclude already added players
    const existingPlayerIds = seasonPlayers.map(sp => sp.player.id);
    const newPlayers = players.filter(p => !existingPlayerIds.includes(p.id));
    const docs = newPlayers.map(player => ({
      player: player,
      seasonId: season!.id,
      losses: 0,
      wins: 0,
      points: 0,
      createdAt: serverTimestamp(),
    }));

    docs.forEach(async doc => {
      await addDoc(collections!.ranking, doc);
    });
  };

  const deletePlayer = async (ranking: Ranking) => {
    if (!collections) return;
    await deleteDoc(doc(collections.ranking, ranking.id));
  };

  const refreshPlayer = async (ranking: Ranking) => {
    if (!collections) return;

    const playerRef = doc(collections.players, ranking.player.id);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
      deletePlayer(ranking);
      return;
    }

    const player = playerSnap.data() as Player;
    const document = doc(collections.ranking, ranking.id);
    await updateDoc(document, {
      ...ranking,
      player: player,
    });
  };

  const handleEdit = async (
    ranking: Ranking,
    field: string,
    value: string | number,
  ) => {
    if (!collections) return;
    const document = doc(collections.ranking, ranking.id);
    await updateDoc(document, {
      ...ranking,
      [field]: value,
    });
  };

  const RefreshPlayer = (ranking: Ranking) =>
    isAdmin && (
      <IconButton size="small" onClick={() => refreshPlayer(ranking)}>
        <Refresh color="primary" fontSize="inherit" />
      </IconButton>
    );

  const DeletePlayer = (ranking: Ranking) =>
    isAdmin && (
      <IconButton size="small" onClick={() => deletePlayer(ranking)}>
        <DeleteIcon color="error" fontSize="inherit" />
      </IconButton>
    );

  const Loading = (
    <Stack
      sx={{
        flex: "1",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <CircularProgress />
    </Stack>
  );

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
    const offsetPosition = (gindex - 1) * group.length;
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
              key={r.id}
              ranking={r}
              position={offsetPosition + index + 1}
              divider={(index + 1) % group.length === 0 && gindex !== 4}
              onEdit={(field, value) => handleEdit(r, field, value)}
              refresh={RefreshPlayer(r)}
              delete={DeletePlayer(r)}
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
          {seasonPlayersLoading && Loading}
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
