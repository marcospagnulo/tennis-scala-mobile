import {Avatar, Chip, CircularProgress, Stack, Typography} from "@mui/material";
import {matchStatusMap, type Match} from "../../../domain/types";
import {useFindById} from "../../../functions/useFindById";
import {collections} from "../../../lib/firebase";
import dayjs from "dayjs";
import {useAppContext} from "../../../app/context";
import {Close, Delete, Done} from "@mui/icons-material";
import {useUpdateChallengeStatus} from "../../../functions";
import {ConfirmDialog} from "../../../components";
import {useState} from "react";
import {deleteChallenge} from "../../../functions/challenge/core";
import {Result} from "./result";

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

const MatchInfo = ({match}: {match: Match}) => {
  const {player, currentSeason} = useAppContext();
  const {loading, updateChallengeStatus} = useUpdateChallengeStatus();

  const [dialogApprove, setDialogApprove] = useState<boolean>(false);
  const [dialogReject, setDialogReject] = useState<boolean>(false);
  const [dialogDelete, setDialogDelete] = useState<boolean>(false);

  const handleUpdateChallengeStatus = async (
    status: "approved" | "rejected",
  ) => {
    await updateChallengeStatus(currentSeason!, match.pid1, match.pid2, status);
    setDialogApprove(false);
    setDialogReject(false);
  };

  const handleDeleteChallenge = async (pid1: string, pid2: string) => {
    await deleteChallenge(currentSeason!, pid1, pid2);
    setDialogDelete(false);
  };

  return (
    <Stack spacing={2}>
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
          {dayjs(match.date.toDate()).format("d MMMM YYYY HH:mm")}
        </Typography>
      </Stack>
      <Stack direction={"row"} sx={{gap: 2}}>
        <Stack sx={{gap: 1, flex: 1, maxWidth: 200}}>
          <Player id={match.pid1} />
          <Player id={match.pid2} />
        </Stack>
        {match.status === "approved" || match.status === "completed" ? (
          <Result match={match} />
        ) : null}
      </Stack>

      <ConfirmDialog
        title="Accetta Sfida"
        open={dialogApprove}
        onClose={() => setDialogApprove(false)}
        content="Confermi di voler accettare la sfida?"
        onConfirm={() => handleUpdateChallengeStatus("approved")}
      />

      <ConfirmDialog
        title="Rifiuta sfida"
        open={dialogReject}
        onClose={() => setDialogReject(false)}
        content="Confermi di voler rifiutare la sfida?"
        onConfirm={() => handleUpdateChallengeStatus("rejected")}
      />

      <ConfirmDialog
        title="Cancella Sfida"
        open={dialogDelete}
        onClose={() => setDialogDelete(false)}
        content="Confermi di voler cancellare la sfida?"
        onConfirm={() => handleDeleteChallenge(match.pid1, match.pid2)}
      />
    </Stack>
  );
};

export {MatchInfo};
