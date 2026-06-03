import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import type {Player, Ranking} from "../../../domain/types";
import {collections} from "../../../lib/firebase";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import {doc, getDoc} from "firebase/firestore";
import {Delete, Refresh, ReportProblem} from "@mui/icons-material";
import {useRefreshRanking} from "../../../functions/ranking/useRefreshRanking";
import {useAppContext} from "../../../app/context";
import {useDeleteRanking} from "../../../functions/ranking/useDeleteRanking";

const RowData = ({label, value}: {label: string; value?: string}) => (
  <Stack direction="row" spacing={1}>
    <Typography color="textSecondary">{label}:</Typography>
    <Typography color="textPrimary">{value || "-"}</Typography>
  </Stack>
);

const PlayerInfo = ({
  ranking,
  open,
  onClose,
}: {
  ranking: Ranking;
  open: boolean;
  onClose: () => void;
}) => {
  const [player, setPlayer] = useState<Player>();
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const {currentSeason, user} = useAppContext();
  const isAdmin = user?.role === "admin";
  const {loading: refreshLoading, refreshRanking} = useRefreshRanking();
  const {loading: deleteLoading, deleteRanking} = useDeleteRanking();

  const handleClose = () => {
    setTimeout(() => {
      setPlayer(undefined);
      setLoading(true);
      setDeleting(false);
    }, 300);
    onClose();
  };

  const handleDelete = () => {
    setDeleting(true);
  };

  const handleConfirmDelete = () => {
    deleteRanking(currentSeason!, ranking);
    setDeleting(false);
    handleClose();
  };

  useEffect(() => {
    if (!collections || !open) {
      setLoading(false);
      return;
    }

    const playerId = ranking.player.id;
    const playerDoc = doc(collections.players, playerId);
    getDoc(playerDoc)
      .then(snapshot => {
        if (snapshot.exists()) {
          setPlayer({
            ...snapshot.data(),
            id: snapshot.id,
          } as Player);
        } else {
          console.error(`info - Player with id ${playerId} not found`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ranking.player.id, open]);

  const handleRefresh = () => {
    refreshRanking(currentSeason!, ranking);
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent
          sx={{height: "50vh", display: "flex", flexDirection: "column"}}>
          {loading && (
            <Stack
              sx={{alignItems: "center", justifyContent: "center", flex: 1}}>
              <CircularProgress />
            </Stack>
          )}
          {!loading && player && (
            <Stack spacing={2}>
              <Avatar
                src={player.avatar}
                sx={{width: 150, height: 150, alignSelf: "center"}}
              />
              <Typography variant="h5" align="center">
                {player.name} {player.surname}
              </Typography>
              <RowData label="Email" value={player.email} />
              <RowData label="Telefono" value={player.phone} />
              <RowData
                label="Data di nascita"
                value={
                  player.birthDate
                    ? dayjs(player.birthDate.toDate()).format("DD/MM/YYYY")
                    : undefined
                }
              />
            </Stack>
          )}
          {!loading && !player && (
            <Stack
              sx={{alignItems: "center", justifyContent: "center", flex: 1}}>
              <ReportProblem color="error" sx={{width: 120, height: 120}} />
              <Typography color="textPrimary" variant="h6" align="center">
                Giocatore non trovato
              </Typography>
            </Stack>
          )}
        </DialogContent>
        {isAdmin && (
          <DialogActions>
            <Button
              variant="text"
              size="small"
              startIcon={<Refresh />}
              disabled={refreshLoading}
              onClick={handleRefresh}>
              Ricarica
            </Button>
            <Button
              variant={deleting ? "contained" : "outlined"}
              size="small"
              color="error"
              sx={{ml: 2}}
              startIcon={<Delete />}
              onClick={deleting ? handleConfirmDelete : handleDelete}
              disabled={deleteLoading}>
              {deleting ? "Conferma" : "Elimina"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export {PlayerInfo};
