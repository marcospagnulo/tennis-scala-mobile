import {IconButton, Link, Stack, Typography, type SxProps} from "@mui/material";
import type {Player, Ranking} from "../../../domain/types";
import {useState} from "react";
import {useAppContext} from "../../../app/context";
import {EditableField} from "./EditableField";
import {useDownBreakpoint} from "../../../hooks/useDownBreakpoint";
import type {Theme} from "@emotion/react";
import {ChallengeIcon} from "../../../icons";
import {PlayerAvatar} from "../../../components";
import {PlayerInfo} from "./PlayerInfo";
import {useEditRanking, useSwapPositions} from "../../../functions";
import {SwapPosition} from "./SwapPosition";

const RankingRow = ({
  ranking,
  bgColor,
  divider,
  challengeable,
}: {
  ranking: Ranking;
  divider?: boolean;
  bgColor?: string;
  challengeable?: boolean;
}) => {
  const player = ranking.player as Player;
  const {user, mobile, currentSeason} = useAppContext();
  const isAdmin = user?.role === "admin";
  const isSmallScreen = useDownBreakpoint("sm");

  const {loading: swapLoading, swapPositions} = useSwapPositions();
  const {loading: editRankingLoading, editRanking} = useEditRanking();
  const loading = swapLoading || editRankingLoading;

  const [hover, setHover] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleEdit = (field: string, value: string | number) => {
    editRanking(currentSeason!, ranking, field, value);
    setHover(false);
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
          flex: 1,
          inlineSize: "0px",
          gap: 1,
        }}>
        {ranking.position <= 3 && (
          <PlayerAvatar
            playerId={player.id!}
            size={isSmallScreen ? 32 : undefined}
          />
        )}
        <Stack
          spacing={1}
          sx={{
            flex: 1,
            alignItems: "center",
            minWidth: 0,
            flexDirection: "row",
          }}>
          <Link
            href="#"
            underline="hover"
            onClick={() => setOpen(true)}
            sx={{display: "block", minWidth: 0, flex: 1}}>
            {isSmallScreen ? (
              <Typography
                sx={truncateSx}
                color="textPrimary"
                variant="subtitle1">
                {player.surname} {player.name ? player.name[0] : ""}.
              </Typography>
            ) : (
              <Typography
                sx={truncateSx}
                color="textPrimary"
                variant="subtitle1">{`${player.surname ?? ""} ${player.name ?? ""}`}</Typography>
            )}
          </Link>
        </Stack>

        <Stack
          direction={"row"}
          spacing={0}
          sx={{
            display: hover && !loading ? "flex" : "none",
          }}>
          <SwapPosition
            season={currentSeason}
            ranking={ranking}
            onSwap={swapPositions}
          />
        </Stack>
        {challengeable && (
          <IconButton size="small">
            <ChallengeIcon color="primary" fontSize="inherit" />
          </IconButton>
        )}
      </Stack>
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
      <PlayerInfo
        ranking={ranking}
        open={open}
        onClose={() => setOpen(false)}
      />
    </Stack>
  );
};

export {RankingRow};
