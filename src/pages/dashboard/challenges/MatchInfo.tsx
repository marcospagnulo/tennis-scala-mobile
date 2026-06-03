import {Avatar, Chip, CircularProgress, Stack, Typography} from "@mui/material";
import type {Match} from "../../../domain/types";
import {useFindById} from "../../../functions/useFindById";
import {collections} from "../../../lib/firebase";
import dayjs from "dayjs";
import {useAppContext} from "../../../app/context";
import {Close, Done} from "@mui/icons-material";
import {useUpdateChallengeStatus} from "../../../functions";
import {ConfirmDialog} from "../../../components";
import {useState} from "react";

const Player = ({id}: {id: string}) => {
  const {data: player, loading} = useFindById({
    collection: collections?.players,
    id,
  });

  return (
    <Stack direction={"row"} sx={{alignItems: "center", gap: 1, minWidth: 150}}>
      {loading && <CircularProgress size={20} sx={{margin: "0 auto"}} />}
      {!loading && player && (
        <>
          <Avatar src={player.avatar} />
          <Typography>
            {player.surname} {player.name}
          </Typography>
        </>
      )}
    </Stack>
  );
};

const MatchInfo = ({match}: {match: Match}) => {
  const {player, currentSeason} = useAppContext();
  const {loading, updateChallengeStatus} = useUpdateChallengeStatus();

  const [dialogApprove, setDialogApprove] = useState<boolean>(false);
  const [dialogReject, setDialogReject] = useState<boolean>(false);

  const handleUpdateChallengeStatus = async (
    status: "approved" | "rejected",
  ) => {
    await updateChallengeStatus(currentSeason!, match.pid1, match.pid2, status);
    setDialogApprove(false);
    setDialogReject(false);
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={"row"}
        sx={{alignItems: "center", justifyContent: "space-between"}}>
        <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
          <Chip
            label={match.status === "pending" ? "In attesa" : "Accettata"}
            color={match.status === "pending" ? "warning" : "success"}
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
        </Stack>
        <Typography variant="body2" color="textSecondary">
          {dayjs(match.date.toDate()).format("d MMMM YYYY HH:mm")}
        </Typography>
      </Stack>
      <Stack direction={"row"} sx={{alignItems: "center", gap: 1}}>
        <Player id={match.pid1} />
        <Typography variant="body2" color="textSecondary">
          vs
        </Typography>
        <Player id={match.pid2} />
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
    </Stack>
  );
};

export {MatchInfo};
