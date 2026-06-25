import {Divider, Stack, Typography, useTheme} from "@mui/material";
import {useRanking} from "../../functions/useRanking";
import {useAppContext} from "../../app/context";
import {RankingRow} from "./row";
import type {Ranking} from "../../domain/types";

const RankingGroup = ({
  group,
  gindex,
  mode,
  live,
}: {
  group: Ranking[];
  gindex: 1 | 2 | 3 | 4;
  mode: "compact" | "expanded";
  live: boolean;
}) => {
  const {player, currentSeasonExpired} = useAppContext();
  const {challengeableRange, minPlayers, liveRanking, rankingPlayer} =
    useRanking();
  const theme = useTheme();

  const getRankingBgColor = (
    index: number,
    playerId: string,
    length: number,
    groupIndex: number,
  ) => {
    const color =
      player?.id === playerId
        ? theme.palette.secondary.main
        : theme.palette.primary.main;

    const alternate = groupIndex % 2 === 0;
    const compare = alternate
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a >= b;
    return compare(index, length / 2) ? color + "10" : color + "20";
  };
  return (
    <Stack direction={"row"}>
      <Stack
        sx={{
          minWidth: 30,
          justifyContent: "center",
          alignItems: "center",
          bgcolor: theme.palette.primary.dark,
        }}>
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.getContrastText(theme.palette.primary.dark),
          }}>
          {gindex}
        </Typography>
      </Stack>
      <Stack sx={{flex: 1}} divider={<Divider />}>
        {group.map((r, index) => {
          let challengablePosition = false;
          const samePlayer = r.player.id === player?.id;
          if (
            challengeableRange &&
            challengeableRange.length === 2 &&
            rankingPlayer
          ) {
            challengablePosition =
              r.position >= challengeableRange[0] &&
              r.position <= challengeableRange[1];
          }
          return (
            <RankingRow
              key={`ranking-${r.position}`}
              ranking={r}
              enableChallenge={
                !samePlayer &&
                challengablePosition &&
                !currentSeasonExpired &&
                minPlayers
              }
              liveRanking={
                live
                  ? undefined
                  : liveRanking?.find(lr => lr.player.id === r.player.id)
              }
              mode={mode}
              bgColor={getRankingBgColor(
                index,
                r.player.id!,
                group.length,
                gindex,
              )}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

export {RankingGroup};
