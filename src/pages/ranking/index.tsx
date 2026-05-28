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
  type SxProps,
} from "@mui/material";
import {collections} from "../../lib/firebase";
import type {Player, queryFilter, querySort, Ranking} from "../../domain/types";
import {Add} from "@mui/icons-material";
import {useAppContext} from "../../app/context";
import {
  addDoc,
  deleteDoc,
  doc,
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

const RankingPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const {user, season} = useAppContext();
  const isAdmin = user?.role === "admin";

  const [filters, setFilters] = useState<queryFilter[]>([]);
  const [sort] = useState<querySort[]>([
    {field: "points", direction: "desc"},
    {field: "wins", direction: "desc"},
    {field: "losses", direction: "asc"},
    {field: "player.surname", direction: "asc"},
  ]);
  const [dialog, setDialog] = useState(false);

  const {items: seasonPlayers, loading: seasonPlayersLoading} =
    useLiveCollection({
      collection: collections?.ranking,
      filters: filters,
      sort: sort,
    });

  useEffect(() => {
    if (!season) return;
    setFilters([{fieldPath: "seasonId", opStr: "==", value: season.id}]);
  }, [season]);

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

  const deletePlayer = async (playerId: string) => {
    if (!collections) return;
    const sp = seasonPlayers.find(sp => sp.player.id === playerId);
    if (!sp) return;

    await deleteDoc(doc(collections.ranking, sp.id));
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

  const DeletePlayer = (player: Player) =>
    isAdmin && (
      <IconButton size="small" onClick={() => deletePlayer(player.id)}>
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

  const getRankingBgColor = (position: number, length: number) => {
    if (length <= 0) return "#b4cbfc";

    const subgroup = Math.min(Math.floor((position * 8) / length), 7);
    return subgroup % 2 === 0 ? "#b4cbfc" : "#d0defd";
  };

  return (
    <Stack sx={{...sx}}>
      <Stack
        sx={{gap: 1, flex: "1 1 0", overflow: "hidden"}}
        divider={<Divider />}>
        <Typography variant="h6" gutterBottom align="center">
          Classifica
        </Typography>
        <RankingHeader />
        <Stack
          sx={{overflow: "auto", flex: "1 1 0", mb: 9}}
          divider={<Divider />}>
          {seasonPlayersLoading && Loading}
          {seasonPlayers.map((r, index) => (
            <RankingRow
              key={r.id}
              ranking={r}
              position={index + 1}
              onEdit={(field, value) => handleEdit(r, field, value)}
              actions={DeletePlayer(r.player)}
              bgColor={getRankingBgColor(index, seasonPlayers.length)}
            />
          ))}
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
