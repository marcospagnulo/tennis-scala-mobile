import {Stack} from "@mui/material";
import {DashboardCard} from "../DashboardCard";
import {MatchIcon} from "../../../icons";
import {MatchesCardContent} from "./Content";
import {useAppContext} from "../../../app/context";
import dayjs from "dayjs";
import {useRanking} from "../../../functions";

const MatchesCard = ({direction}: {direction?: "row" | "column"}) => {
  const {player, currentSeason} = useAppContext();
  const {minPlayers} = useRanking();
  const seasonExpired = currentSeason
    ? dayjs(currentSeason.end.toDate()).isBefore(dayjs())
    : false;

  const isMember =
    currentSeason?.ranking.find(r => r.player.id === player?.id) !== undefined;

  if (!isMember || seasonExpired || !minPlayers) return <></>;

  return (
    <DashboardCard
      direction={direction}
      image={
        <Stack
          sx={{
            bgcolor: "primary.dark",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <MatchIcon color="secondary" sx={{width: "70%", height: "70%"}} />
        </Stack>
      }
      content={<MatchesCardContent />}
    />
  );
};

export {MatchesCard};
