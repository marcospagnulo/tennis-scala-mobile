import {Divider, Stack, Typography} from "@mui/material";
import {useRanking} from "../../../functions";
import {useAppContext} from "../../../app/context";
import {RankingRow} from "../../ranking/row";
import {RankingHeader} from "../../ranking/Header";
import {useEffect, useState} from "react";
import type {Match} from "../../../domain/types";
import {MatchInfo} from "../../../components/match";

const ChallengesCardContent = () => {
  const {currentSeason, player} = useAppContext();
  const {challengeableRange} = useRanking();

  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const period = currentSeason?.periods.find(p => !p.end);
    if (period) {
      const matchesArray = Object.values(period.matches).filter(
        m => m.pid1 === player?.id || m.pid2 === player?.id,
      );
      setMatches(matchesArray);
    }
  }, [currentSeason, player]);

  if (!currentSeason) return null;

  return (
    <Stack sx={{px: 2, gap: 2}}>
      <Stack sx={{gap: 1}}>
        <Typography align="center" variant="h6">
          Le tue sfide
        </Typography>
        <Divider />
        <Stack sx={{gap: 1}} divider={<Divider />}>
          {matches.map((m, index) => (
            <MatchInfo key={`match-info-${index}`} match={m} />
          ))}
        </Stack>
      </Stack>
      <Stack sx={{my: 2}}>
        <Typography align="center" variant="h6">
          Sfida un giocatore
        </Typography>
        <RankingHeader sx={{ml: "-30px"}} mode="compact" />
        <Divider />
        {currentSeason.ranking
          .filter(
            r =>
              r.position >= challengeableRange[0] &&
              r.position <= challengeableRange[1],
          )
          .map(r => (
            <RankingRow
              mode="compact"
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
