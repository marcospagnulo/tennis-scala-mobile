import {Avatar, IconButton, Stack, Typography} from "@mui/material";
import type {Player, Ranking} from "../../domain/types";
import {EditableTypography} from "../../components/EditableTypography";
import {useState} from "react";
import {EditIcon} from "../../icons";

const RankingRow = ({
  ranking,
  position,
  actions,
  onEditPoint,
}: {
  ranking: Ranking;
  position: number;
  onEditPoint: (value: string | number) => void;
  actions?: React.ReactNode;
}) => {
  const player = ranking.player as Player;
  const [hover, setHover] = useState(false);
  const [editPoint, setEditPoint] = useState(false);

  return (
    <Stack
      direction="row"
      sx={{alignItems: "center", gap: 2}}
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
      <Stack direction={"row"} sx={{flex: 1, gap: 1, alignItems: "center"}}>
        <EditableTypography
          variant="body2"
          value={ranking.points}
          edit={editPoint}
          onConfirm={value => onEditPoint(value)}
          onCancel={() => setEditPoint(false)}
          type="number"
        />
        <IconButton
          sx={{visibility: hover ? "visible" : "hidden"}}
          size="small"
          onClick={() => setEditPoint(true)}>
          {!editPoint && <EditIcon fontSize="inherit" />}
        </IconButton>
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
