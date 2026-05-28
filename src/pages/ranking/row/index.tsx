import {Avatar, Box, Stack, Typography} from "@mui/material";
import type {Player, Ranking} from "../../../domain/types";
import {useState} from "react";
import {useAppContext} from "../../../app/context";
import {EditableField} from "./EditableField";
import {useDownBreakpoint} from "../../../hooks/useDownBreakpoint";

const RankingRow = ({
  ranking,
  position,
  refresh,
  delete: deleteAction,
  bgColor,
  onEdit,
}: {
  ranking: Ranking;
  position: number;
  refresh?: React.ReactNode;
  delete?: React.ReactNode;
  bgColor?: string;
  onEdit: (field: string, value: string | number) => void;
}) => {
  const player = ranking.player as Player;
  const [hover, setHover] = useState(false);
  const {user, mobile} = useAppContext();
  const isAdmin = user?.role === "admin";
  const isSmallScreen = useDownBreakpoint("sm");

  const handleEdit = (field: string, value: string | number) => {
    onEdit(field, Number(value));
    setHover(false);
  };

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: 2,
        backgroundColor: bgColor,
        py: 1,
        px: 2,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}>
      <Typography
        variant="h6"
        align="center"
        sx={{minWidth: 20}}
        color="textPrimary">
        {position}
      </Typography>
      <Stack
        direction={"row"}
        sx={{
          alignItems: "center",
          gap: 1,
          flex: 1,
          minWidth: 180,
        }}>
        <Avatar
          sx={{...(isSmallScreen && {width: 32, height: 32})}}
          src={player.avatar}
          alt={`${player.surname} ${player.name}`}
        />
        {isSmallScreen ? (
          <Stack>
            <Typography
              color="textPrimary"
              variant="subtitle1"
              sx={{lineHeight: 1.3}}>
              {player.surname} {player.name[0]}.
            </Typography>
          </Stack>
        ) : (
          <Typography
            color="textPrimary"
            variant="subtitle1">{`${player.surname} ${player.name}`}</Typography>
        )}
        {refresh && (
          <Box sx={{ml: 1, visibility: hover ? "visible" : "hidden"}}>
            {refresh}
          </Box>
        )}
      </Stack>
      <EditableField
        width={mobile ? 50 : 100}
        field="points"
        value={ranking.points}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={handleEdit}
      />
      <Typography
        sx={{width: mobile ? 50 : 100}}
        variant="body2"
        color="text.secondary"
        align="center">
        {ranking.wins + ranking.losses}
      </Typography>
      <EditableField
        width={mobile ? 50 : 100}
        field="wins"
        value={ranking.wins}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={handleEdit}
      />
      <EditableField
        width={mobile ? 50 : 100}
        field="losses"
        value={ranking.losses}
        isAdmin={isAdmin}
        hover={hover}
        onEdit={handleEdit}
      />
      {deleteAction && (
        <Stack
          direction="row"
          sx={{
            width: 40,
            gap: 1,
            ml: "auto",
            visibility: hover ? "visible" : "hidden",
          }}>
          {deleteAction}
        </Stack>
      )}
    </Stack>
  );
};

export {RankingRow};
