import {Stack, Typography} from "@mui/material";
import {useRanking} from "../../../functions";
import {useAppContext} from "../../../app/context";
import {RankingRow} from "../../ranking/row";
import {RankingHeader} from "../../ranking/Header";

const ChallengesCardContent = () => {
  const {currentSeason, player} = useAppContext();
  const {challengeableRange} = useRanking();

  if (!currentSeason) return null;

  return (
    <Stack>
      <Stack sx={{px: 2}}>
        <RankingHeader sx={{ml: "-30px"}} />
        {currentSeason.ranking
          .filter(
            r =>
              r.position > challengeableRange[0] &&
              r.position <= challengeableRange[1],
          )
          .map(r => (
            <RankingRow
              key={`challenge-${r.position}`}
              ranking={r}
              challengeable={r.player.id !== player?.id}
              bgColor={
                r.player.id === player?.id ? "secondary.light" : "transparent"
              }
            />
          ))}
      </Stack>
    </Stack>
  );
};

export {ChallengesCardContent};
