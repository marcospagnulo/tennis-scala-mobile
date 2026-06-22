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
import {MatchIcon} from "../../../icons";
import {PlayerAvatar} from "../../../components";
import {PlayerInfo} from "./PlayerInfo";
import {useEditRanking, useSwapPositions} from "../../../functions";
import {SwapPosition} from "./SwapPosition";
import {ChallengeDialog} from "./ChallengeDialog";
import {green} from "@mui/material/colors";
import {DiffPosition} from "./DiffPosition";
import {ToggleLock} from "./ToggleLock";

const RankingRow = ({
  ranking,
  bgColor,
  enableChallenge,
  liveRanking,
  mode,
}: {
  ranking: Ranking;
  liveRanking?: Ranking;
  mode: "compact" | "expanded";
  bgColor?: string;
  enableChallenge?: boolean;
}) => {
  const player = ranking.player as Player;
  const {user, mobile, currentSeason} = useAppContext();
  const isAdmin = user?.role === "admin";
  const isSmallScreen = useDownBreakpoint("sm");

  const {loading: swapLoading, swapPositions} = useSwapPositions();
  const {loading: editRankingLoading, editRanking} = useEditRanking();
  const loading = swapLoading || editRankingLoading;

  const [hover, setHover] = useState<boolean>(false);
  const [playerOpen, setPlayerOpen] = useState<boolean>(false);
  const [challengePlayerId, setChallengePlayerId] = useState<string>();

  const handleEdit = (field: keyof Ranking, value: string | number) => {
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
        opacity: loading ? 0.5 : 1,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}>
      <Stack
        direction={"row"}
        sx={{
          width: 50,
          justifyContent: "start",
          alignItems: "center",
        }}>
        <Typography
          variant={ranking.position <= 3 ? "h6" : "body2"}
          align="left"
          sx={{mx: 1}}
          color="textPrimary">
          {ranking.position}
        </Typography>
        <DiffPosition
          big={ranking.position <= 3}
          position={ranking.position}
          livePosition={liveRanking?.position}
        />
      </Stack>
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
            onClick={() => setPlayerOpen(true)}
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
            player={ranking}
            lastPosition={currentSeason.ranking.length}
            onSwap={(from, to) => swapPositions(currentSeason, from, to)}
          />
          <ToggleLock
            lock={ranking.status !== "active"}
            onToggleLock={lock => {
              editRanking(
                currentSeason,
                ranking,
                "status",
                lock ? "unactive" : "active",
              );
            }}
          />
        </Stack>
        {enableChallenge && (
          <IconButton
            disabled={ranking.status === "unactive"}
            size="small"
            onClick={() => setChallengePlayerId(ranking.player.id)}>
            <MatchIcon
              color={ranking.status === "unactive" ? "disabled" : "primary"}
              fontSize="inherit"
            />
          </IconButton>
        )}
      </Stack>
      <EditableField
        width={mobile ? 80 : 120}
        field="points"
        value={ranking.points}
        liveValue={liveRanking?.points}
        liveColor={green[500]}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={(_f, v) => handleEdit("points", v)}
      />
      <Typography
        sx={{width: mobile ? 25 : 70}}
        variant="body2"
        color="text.secondary"
        align="center">
        {ranking.wins + ranking.losses + ranking.draws}
      </Typography>
      {mode === "expanded" && (
        <>
          <EditableField
            width={mobile ? 25 : 70}
            field="wins"
            value={ranking.wins}
            isAdmin={isAdmin}
            hover={hover}
            onEdit={(_f, v) => handleEdit("wins", v)}
          />
          <EditableField
            width={mobile ? 25 : 70}
            field="draws"
            value={ranking.draws}
            isAdmin={isAdmin}
            hover={hover}
            onEdit={(_f, v) => handleEdit("draws", v)}
          />
          <EditableField
            width={mobile ? 25 : 70}
            field="losses"
            value={ranking.losses}
            isAdmin={isAdmin}
            hover={hover}
            onEdit={(_f, v) => handleEdit("losses", v)}
          />
        </>
      )}
      <Box sx={{width: 8}} />
      <PlayerInfo
        ranking={ranking}
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
      />
      <ChallengeDialog
        open={!!challengePlayerId}
        challengePlayerId={challengePlayerId}
        onClose={() => setChallengePlayerId(undefined)}
      />
    </Stack>
  );
};

export {RankingRow};
