import {Avatar, IconButton, Stack, Typography} from "@mui/material";
import type {Player, Ranking} from "../../domain/types";
import {EditableTypography} from "../../components/EditableTypography";
import {useState} from "react";
import {EditIcon} from "../../icons";
import {useAppContext} from "../../app/context";

const RankingRow = ({
  ranking,
  position,
  actions,
  bgColor,
  onEditPoint,
}: {
  ranking: Ranking;
  position: number;
  actions?: React.ReactNode;
  bgColor?: string;
  onEditPoint: (value: number) => void;
}) => {
  const player = ranking.player as Player;
  const [hover, setHover] = useState(false);
  const [editPoint, setEditPoint] = useState(false);
  const {user} = useAppContext();
  const isAdmin = user?.role === "admin";

  const handleEditPoint = (value: string) => {
    onEditPoint(Number(value));
    setEditPoint(false);
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
        sx={{width: 20}}
        color="textPrimary">
        {position}
      </Typography>
      <Stack direction={"row"} sx={{alignItems: "center", gap: 1, width: 300}}>
        <Avatar src={player.avatar} alt={`${player.surname} ${player.name}`} />
        <Typography
          color="textPrimary"
          variant="subtitle1">{`${player.surname} ${player.name}`}</Typography>
      </Stack>
      <Stack
        direction={"row"}
        sx={{
          width: 100,
          gap: 1,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <EditableTypography
          variant="body2"
          value={ranking.points + ""}
          edit={editPoint}
          onConfirm={handleEditPoint}
          onCancel={() => setEditPoint(false)}
          type="number"
        />
        {isAdmin && (
          <IconButton
            sx={{visibility: hover ? "visible" : "hidden", mr: -4}}
            size="small"
            onClick={() => setEditPoint(true)}>
            {!editPoint && <EditIcon fontSize="inherit" />}
          </IconButton>
        )}
      </Stack>
      <Typography
        sx={{flex: 1}}
        variant="body2"
        color="text.secondary"
        align="center">
        {ranking.wins + ranking.losses}
      </Typography>
      <Typography
        sx={{flex: 1}}
        variant="body2"
        color="text.secondary"
        align="center">
        {ranking.wins}
      </Typography>
      <Typography
        sx={{flex: 1}}
        variant="body2"
        color="text.secondary"
        align="center">
        {ranking.losses}
      </Typography>
      {actions && (
        <Stack
          direction="row"
          sx={{gap: 1, ml: "auto", visibility: hover ? "visible" : "hidden"}}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export {RankingRow};
