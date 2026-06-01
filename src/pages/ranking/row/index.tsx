import {
  Box,
  IconButton,
  Link,
  Stack,
  Typography,
  type SxProps,
} from "@mui/material";
import type {Player, Ranking} from "../../../domain/types";
import {useState} from "react";
import {useAppContext} from "../../../app/context";
import {EditableField} from "./EditableField";
import {useDownBreakpoint} from "../../../hooks/useDownBreakpoint";
import type {Theme} from "@emotion/react";
import {DeleteIcon} from "../../../icons";
import {ExpandLess, ExpandMore, Refresh} from "@mui/icons-material";
import {ConfirmDialog, PlayerAvatar} from "../../../components";
import {PlayerInfo} from "./PlayerInfo";
import {useEditRanking, useSwapPositions} from "../../../functions";
import {useDeleteRanking} from "../../../functions/ranking/useDeleteRanking";
import {useRefreshRanking} from "../../../functions/ranking/useRefreshRanking";

const RankingRow = ({
  ranking,
  bgColor,
  divider,
}: {
  ranking: Ranking;
  divider: boolean;
  bgColor?: string;
}) => {
  const player = ranking.player as Player;
  const {user, mobile, currentSeason} = useAppContext();
  const isAdmin = user?.role === "admin";
  const isSmallScreen = useDownBreakpoint("sm");

  const {loading: swapLoading, swapPositions} = useSwapPositions();
  const {loading: deleteLoading, deleteRanking} = useDeleteRanking();
  const {loading: refreshLoading, refreshRanking} = useRefreshRanking();
  const {loading: editRankingLoading, editRanking} = useEditRanking();
  const loading =
    swapLoading || deleteLoading || refreshLoading || editRankingLoading;

  const [hover, setHover] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleEdit = (field: string, value: string | number) => {
    editRanking(currentSeason!, ranking, field, value);
    setHover(false);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteRanking(currentSeason!, ranking);
    setOpenDeleteDialog(false);
  };

  const truncateSx: SxProps<Theme> = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  if (!currentSeason) return null;

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: mobile ? 1 : 2,
        backgroundColor: bgColor,
        py: 1,
        px: mobile ? 0 : 2,
        ...(divider && {
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }),
        opacity: loading ? 0.5 : 1,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}>
      <Typography
        variant={ranking.position <= 3 ? "h6" : "body2"}
        align="center"
        sx={{minWidth: 20}}
        color="textPrimary">
        {ranking.position}
      </Typography>
      <Stack
        direction={"row"}
        sx={{
          alignItems: "center",
          gap: 1,
        }}>
        {ranking.position <= 3 && (
          <PlayerAvatar
            playerId={player.id!}
            size={isSmallScreen ? 32 : undefined}
          />
        )}
        <Link href="#" underline="hover" onClick={() => setOpen(true)}>
          {isSmallScreen ? (
            <Typography color="textPrimary" variant="subtitle1" sx={truncateSx}>
              {player.surname} {player.name ? player.name[0] : ""}.
            </Typography>
          ) : (
            <Typography
              color="textPrimary"
              variant="subtitle1">{`${player.surname ?? ""} ${player.name ?? ""}`}</Typography>
          )}
        </Link>
        <PlayerInfo
          ranking={ranking}
          open={open}
          onClose={() => setOpen(false)}
        />
      </Stack>
      <Box sx={{flex: 1}} />
      {isAdmin && !mobile && (
        <Stack
          direction={"row"}
          spacing={1}
          sx={{ml: 1, display: hover && !loading ? "flex" : "none"}}>
          {ranking.position > 1 && (
            <IconButton
              size="small"
              onClick={() =>
                swapPositions(
                  currentSeason,
                  ranking.position,
                  ranking.position - 1,
                )
              }>
              <ExpandLess color="primary" fontSize="inherit" />
            </IconButton>
          )}
          {ranking.position < currentSeason.ranking!.length && (
            <IconButton
              size="small"
              onClick={() =>
                swapPositions(
                  currentSeason,
                  ranking.position,
                  ranking.position + 1,
                )
              }>
              <ExpandMore color="primary" fontSize="inherit" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => refreshRanking(currentSeason, ranking)}>
            <Refresh color="primary" fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={handleDelete}>
            <DeleteIcon color="error" fontSize="inherit" />
          </IconButton>
        </Stack>
      )}
      <EditableField
        width={mobile ? 25 : 100}
        field="points"
        value={ranking.points}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={handleEdit}
      />
      <Typography
        sx={{width: mobile ? 25 : 100}}
        variant="body2"
        color="text.secondary"
        align="center">
        {ranking.wins + ranking.losses}
      </Typography>
      <EditableField
        width={mobile ? 25 : 100}
        field="wins"
        value={ranking.wins}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={handleEdit}
      />
      <EditableField
        width={mobile ? 25 : 100}
        field="losses"
        value={ranking.losses}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={handleEdit}
      />
      <Stack
        direction="row"
        sx={{
          width: 16,
          gap: 1,
        }}
      />
      <ConfirmDialog
        open={openDeleteDialog}
        title="Conferma eliminazione"
        content={`Sei sicuro di voler eliminare ${player.surname} ${player.name}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenDeleteDialog(false)}
      />
    </Stack>
  );
};

export {RankingRow};
