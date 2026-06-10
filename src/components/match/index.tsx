import {
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  type SxProps,
} from "@mui/material";
import {matchStatusMap, type Match} from "../../domain/types";
import {useFindById} from "../../functions/useFindById";
import {collections} from "../../lib/firebase";
import dayjs from "dayjs";
import {useAppContext} from "../../app/context";
import {Close, Delete, Done, PanToolAlt} from "@mui/icons-material";
import {useUpdateMatchStatus} from "../../functions";
import {ConfirmDialog} from "..";
import {useState} from "react";
import {Result} from "./result";
import {useDeleteMatch} from "../../functions/match/useDeleteMatch";
import {useDownBreakpoint} from "../../hooks/useDownBreakpoint";
import type {Theme} from "@emotion/react";

const truncateSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const Player = ({id}: {id: string}) => {
  const downSm = useDownBreakpoint("sm");
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
          <Typography variant="body1" sx={{...truncateSx}}>
            {downSm
              ? `${player.surname} ${player.name?.[0]}.`
              : `${player.surname} ${player.name}`}
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

const MatchInfo = ({match, expired}: {match: Match; expired: boolean}) => {
  const downSm = useDownBreakpoint("sm");
  const {user, player, currentSeason} = useAppContext();
  const isAdmin = user?.role === "admin";
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

  const pendingOrRejected =
    match.status === "pending" || match.status === "rejected";
  const isUserPlayer1 = match.pid1 === player?.id;
  const isUserPlayer2 = match.pid2 === player?.id;
  const isUserInMatchAndApproved =
    (isUserPlayer1 || isUserPlayer2) && match.status === "approved";
  const hideResult =
    (match.status === "pending" ||
      match.status === "rejected" ||
      match.status === "approved") &&
    !isUserInMatchAndApproved &&
    !isAdmin;

  return (
    <>
      <Stack direction={"row"} sx={{gap: 1, alignItems: "center", flex: 1}}>
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            height: "100%",
            minWidth: 60,
            py: 0.5,
            gap: 0.5,
          }}>
          <Typography variant="h5">
            {dayjs(match.date.toDate()).format("D")}
          </Typography>
          <Typography variant="body2" sx={{textTransform: "capitalize"}}>
            {dayjs(match.date.toDate()).format("MMM")}
          </Typography>
          <Typography variant="body2">
            {dayjs(match.date.toDate()).format("HH:mm")}
          </Typography>
        </Stack>
        <Stack
          sx={{
            flex: 1,
            gap: 1,
            py: 1,
          }}>
          <Stack direction={"row"} spacing={1}>
            <Stack
              direction={hideResult ? "row" : "column"}
              sx={{
                gap: 1,
                flex: 1,
                ...(!hideResult
                  ? {maxWidth: downSm ? 120 : 200}
                  : {alignItems: "center", justifyContent: "center"}),
              }}>
              <Player id={match.pid1} />
              {hideResult && (
                <PanToolAlt color="action" sx={{transform: "rotate(90deg)"}} />
              )}
              <Player id={match.pid2} />
            </Stack>
            {!hideResult && <Result match={match} expired={expired} />}
          </Stack>
          {(isAdmin ||
            (match.status !== "completed" && !isUserInMatchAndApproved)) && (
            <Stack
              direction={"row"}
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
                mr: 1,
                gap: 1,
              }}>
              <Chip
                label={matchStatusMap[match.status]}
                color={matchStatusColorMap[match.status]}
                size="small"
              />
              {pendingOrRejected && isUserPlayer2 && !expired && (
                <>
                  <Chip
                    variant="outlined"
                    disabled={loading}
                    label="Accetta"
                    size="small"
                    icon={<Done fontSize="small" />}
                    onClick={() => setDialogApprove(true)}
                    color="success"
                  />
                  <Chip
                    variant="outlined"
                    disabled={loading}
                    label="Rifiuta"
                    size="small"
                    icon={<Close fontSize="small" />}
                    onClick={() => setDialogReject(true)}
                    color="error"
                  />
                </>
              )}
              {(match.status === "pending" && isUserPlayer1) ||
                (isAdmin && (
                  <Chip
                    variant="outlined"
                    disabled={loading}
                    label="Cancella"
                    size="small"
                    icon={<Delete fontSize="small" />}
                    onClick={() => setDialogDelete(true)}
                    color="error"
                  />
                ))}
            </Stack>
          )}
        </Stack>
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
    </>
  );
};

export {MatchInfo};
