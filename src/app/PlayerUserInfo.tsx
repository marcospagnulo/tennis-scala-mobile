import {Avatar, Stack, Typography} from "@mui/material";
import type {Player, User} from "../domain/types";

const PlayerUserInfo = ({user, player}: {user: User; player: Player}) => {
  return (
    <Stack direction="row" sx={{gap: 1, alignItems: "center"}}>
      <Avatar
        alt={user?.displayName || "User Avatar"}
        src={player?.avatar || ""}
      />
      <Stack>
        {player.name && player.surname && (
          <Typography variant="body1">{`${player.name} ${player.surname}`}</Typography>
        )}
        <Typography variant="body2">{user.email}</Typography>
      </Stack>
    </Stack>
  );
};

export {PlayerUserInfo};
