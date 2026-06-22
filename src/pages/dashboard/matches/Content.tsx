import {Divider, Stack, Typography} from "@mui/material";
import {useRanking} from "../../../functions";
import {useAppContext} from "../../../app/context";
import {RankingRow} from "../../ranking/row";
import {RankingHeader} from "../../ranking/Header";
import {useEffect, useState} from "react";
import type {Match} from "../../../domain/types";
import {MatchInfo} from "../../../components/match";
import dayjs from "dayjs";

const MatchesCardContent = () => {
  const {currentSeason, player} = useAppContext();
  const {challengeableRange, minPlayers} = useRanking();
  const seasonExpired = currentSeason
    ? dayjs(currentSeason.end.toDate()).isBefore(dayjs())
    : false;

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
    <Stack sx={{gap: 2}}>
      {matches.length > 0 && (
        <Stack>
          <Typography align="center" variant="h6">
            Le tue sfide
          </Typography>
          <Divider />
          <Stack sx={{pr: 2}} divider={<Divider />}>
            {[
              ...matches
                .sort((a, b) => a.date.toMillis() - b.date.toMillis())
                .map((m, index) => (
                  <MatchInfo key={`match-info-${index}`} match={m} />
                )),
            ]}
          </Stack>
          <Divider />
        </Stack>
      )}
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
              enableChallenge={
                r.player.id !== player?.id && !seasonExpired && minPlayers
              }
              bgColor={
                r.player.id === player?.id ? "secondary.light" : "transparent"
              }
            />
          ))}
      </Stack>
    </Stack>
  );
};

export {MatchesCardContent};
