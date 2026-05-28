import {
  Box,
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
import {RankingRow} from "./RankingRow";
import {useEffect, useState} from "react";
import {PlayerList} from "./player-list";

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

  const handleEditPoint = async (ranking: Ranking, points: number) => {
    if (!collections) return;
    const document = doc(collections.ranking, ranking.id);
    await updateDoc(document, {
      ...ranking,
      points: points,
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

  const Header = (
    <Stack direction="row" sx={{alignItems: "center", gap: 2, px: 2}}>
      <Typography variant="h6" align="center" sx={{width: 20}}>
        #
      </Typography>
      <Typography variant="subtitle1" sx={{minWidth: 250}}>
        Giocatore
      </Typography>
      <Typography
        sx={{width: 100}}
        variant="body2"
        color="text.secondary"
        align="center">
        Punti
      </Typography>
      <Typography
        sx={{flex: 1}}
        variant="body2"
        color="text.secondary"
        align="center">
        Partite
      </Typography>
      <Typography
        sx={{flex: 1}}
        variant="body2"
        color="text.secondary"
        align="center">
        Vittorie
      </Typography>
      <Typography
        sx={{flex: 1}}
        variant="body2"
        color="text.secondary"
        align="center">
        Sconfitte
      </Typography>
      {isAdmin && <Box sx={{width: 40}} />}
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
        {Header}
        <Stack
          sx={{overflow: "auto", flex: "1 1 0", mb: 9}}
          divider={<Divider />}>
          {seasonPlayersLoading && Loading}
          {seasonPlayers.map((r, index) => (
            <RankingRow
              key={r.id}
              ranking={r}
              position={index + 1}
              onEditPoint={value => handleEditPoint(r, value as number)}
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
