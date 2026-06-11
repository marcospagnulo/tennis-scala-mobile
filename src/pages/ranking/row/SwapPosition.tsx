import {IconButton} from "@mui/material";
import type {Ranking} from "../../../domain/types";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useAppContext} from "../../../app/context";

const SwapPosition = ({
  player,
  lastPosition,
  onSwap,
}: {
  player: Ranking;
  lastPosition: number;
  onSwap: (from: number, to: number) => void;
}) => {
  const {user, mobile} = useAppContext();
  const isAdmin = user?.role === "admin";

  if (!isAdmin || mobile) return null;

  return (
    <>
      {player.position > 1 && (
        <IconButton
          size="small"
          onClick={() => onSwap(player.position, player.position - 1)}>
          <ExpandLess color="primary" fontSize="inherit" />
        </IconButton>
      )}
      {player.position < lastPosition && (
        <IconButton
          size="small"
          onClick={() => onSwap(player.position, player.position + 1)}>
          <ExpandMore color="primary" fontSize="inherit" />
        </IconButton>
      )}
    </>
  );
};

export {SwapPosition};
