import {Avatar, Chip, CircularProgress, Stack, Typography} from "@mui/material";
import {matchStatusMap, type Match} from "../../domain/types";
import {useFindById} from "../../functions/useFindById";
import {collections} from "../../lib/firebase";
import dayjs from "dayjs";
import {useAppContext} from "../../app/context";
import {Close, Delete, Done} from "@mui/icons-material";
import {useUpdateMatchStatus} from "../../functions";
import {ConfirmDialog} from "..";
import {useState} from "react";
import {Result} from "./result";
import {useDeleteMatch} from "../../functions/match/useDeleteMatch";

const Player = ({id}: {id: string}) => {
  const {data: player, loading} = useFindById({
    collection: collections?.players,
    id,
  });

  return (
    <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
      {loading && <CircularProgress size={20} sx={{margin: "0 auto"}} />}
      {!loading && player && (
        <>
          <Avatar src={player.avatar} sx={{width: 28, height: 28}} />
          <Typography variant="body1">
            {player.surname} {player.name}
          </Typography>
        </>
      )}
    </Stack>
  );
};

const matchStatusColorMap: Record<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  completed: "default",
};

const MatchInfo = ({
  match,
  readonly = false,
}: {
  match: Match;
  readonly?: boolean;
}) => {
  const {player, currentSeason} = useAppContext();
  const {loading: updateLoading, updateMatchStatus} = useUpdateMatchStatus();
  const {deleteMatch, loading: deleteLoading} = useDeleteMatch();
  const loading = updateLoading || deleteLoading;

  const [dialogApprove, setDialogApprove] = useState<boolean>(false);
  const [dialogReject, setDialogReject] = useState<boolean>(false);
  const [dialogDelete, setDialogDelete] = useState<boolean>(false);

  const handleUpdateMatchStatus = async (status: "approved" | "rejected") => {
    await updateMatchStatus(currentSeason!, match.id, status);
    setDialogApprove(false);
    setDialogReject(false);
  };

  const handleDeleteMatch = async () => {
    await deleteMatch(currentSeason!, match.id);
    setDialogDelete(false);
  };

  return (
    <Stack spacing={2}>
      {!readonly && (
        <Stack
          direction={"row"}
          sx={{alignItems: "center", justifyContent: "space-between"}}>
          <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
            <Chip
              label={matchStatusMap[match.status]}
              color={matchStatusColorMap[match.status]}
            />
            {match.status === "pending" && match.pid2 === player?.id && (
              <>
                <Chip
                  variant="outlined"
                  disabled={loading}
                  label="Accetta"
                  icon={<Done fontSize="small" />}
                  onClick={() => setDialogApprove(true)}
                  color="success"
                />
                <Chip
                  variant="outlined"
                  disabled={loading}
                  label="Rifiuta"
                  icon={<Close fontSize="small" />}
                  onClick={() => setDialogReject(true)}
                  color="error"
                />
              </>
            )}
            {match.status === "pending" && match.pid1 === player?.id && (
              <Chip
                variant="outlined"
                disabled={loading}
                label="Cancella"
                icon={<Delete fontSize="small" />}
                onClick={() => setDialogDelete(true)}
                color="error"
              />
            )}
          </Stack>
          <Typography variant="body2" color="textSecondary">
            {dayjs(match.date.toDate()).format("D MMMM YYYY HH:mm")}
          </Typography>
        </Stack>
      )}
      <Stack direction={"row"} sx={{gap: 2, alignItems: "center"}}>
        {readonly && (
          <Stack
            sx={{
              alignItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              width: 80,
              p: 1,
            }}>
            <Typography variant="h5">
              {dayjs(match.date.toDate()).format("D")}
            </Typography>
            <Typography variant="body2">
              {dayjs(match.date.toDate()).format("MMM")}
            </Typography>
            <Typography variant="body2">
              {dayjs(match.date.toDate()).format("HH:mm")}
            </Typography>
          </Stack>
        )}
        <Stack sx={{gap: 1, flex: 1, maxWidth: 200}}>
          <Player id={match.pid1} />
          <Player id={match.pid2} />
        </Stack>
        <Result match={match} readonly={readonly} />
      </Stack>

      <ConfirmDialog
        title="Accetta Sfida"
        open={dialogApprove}
        onClose={() => setDialogApprove(false)}
        content="Confermi di voler accettare la sfida?"
        onConfirm={() => handleUpdateMatchStatus("approved")}
      />

      <ConfirmDialog
        title="Rifiuta sfida"
        open={dialogReject}
        onClose={() => setDialogReject(false)}
        content="Confermi di voler rifiutare la sfida?"
        onConfirm={() => handleUpdateMatchStatus("rejected")}
      />

      <ConfirmDialog
        title="Cancella Sfida"
        open={dialogDelete}
        onClose={() => setDialogDelete(false)}
        content="Confermi di voler cancellare la sfida?"
        onConfirm={() => handleDeleteMatch()}
      />
    </Stack>
  );
};

export {MatchInfo};
