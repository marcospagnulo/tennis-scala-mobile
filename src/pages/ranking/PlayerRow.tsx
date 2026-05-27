import {Avatar, Stack, Typography} from "@mui/material";
import type {Player} from "../../domain/types";

const PlayerRow = ({
  player,
  actions,
}: {
  player: Player;
  actions?: React.ReactNode;
}) => {
  return (
    <Stack direction="row" sx={{alignItems: "center", gap: 2}}>
      <Avatar src={player.avatar} alt={`${player.surname} ${player.name}`} />
      <Typography>{`${player.surname} ${player.name}`}</Typography>
      {actions && (
        <Stack direction="row" sx={{gap: 1, ml: "auto"}}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export {PlayerRow};
