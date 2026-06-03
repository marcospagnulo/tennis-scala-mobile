import {IconButton} from "@mui/material";
import type {Ranking, Season} from "../../../domain/types";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useAppContext} from "../../../app/context";

const SwapPosition = ({
  season,
  ranking,
  onSwap,
}: {
  season: Season;
  ranking: Ranking;
  onSwap: (season: Season, from: number, to: number) => void;
}) => {
  const {user, mobile} = useAppContext();
  const isAdmin = user?.role === "admin";

  if (!isAdmin || mobile) return null;

  return (
    <>
      {ranking.position > 1 && (
        <IconButton
          size="small"
          onClick={() =>
            onSwap(season, ranking.position, ranking.position - 1)
          }>
          <ExpandLess color="primary" fontSize="inherit" />
        </IconButton>
      )}
      {ranking.position < season.ranking!.length && (
        <IconButton
          size="small"
          onClick={() =>
            onSwap(season, ranking.position, ranking.position + 1)
          }>
          <ExpandMore color="primary" fontSize="inherit" />
        </IconButton>
      )}
    </>
  );
};

export {SwapPosition};
