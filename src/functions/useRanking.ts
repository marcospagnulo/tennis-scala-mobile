import {useEffect, useState} from "react";
import type {Ranking} from "../domain/types";
import {useAppContext} from "../app/context";
import {calculateNewRanking} from "../util";

type rankingGroupsType = {
  1: Ranking[];
  2: Ranking[];
  3: Ranking[];
  4: Ranking[];
};

const useRanking = (live?: boolean) => {
  const {currentSeason, player} = useAppContext();

  const [liveRanking, setLiveRanking] = useState<Ranking[]>([]);
  const [empty, setEmpty] = useState<boolean>(false);
  const [rankingPlayer, setRankingPlayer] = useState<Ranking>();
  const [challengeableRange, setChallengeableRange] = useState<
    [number, number]
  >([0, 0]);
  const [rankingGroups, setRankingGroups] = useState<rankingGroupsType>({
    1: [],
    2: [],
    3: [],
    4: [],
  });

  const findPlayerGroup = (
    rankingGroups: rankingGroupsType,
    playerId?: string,
  ): number | null => {
    if (!playerId) return null;
    for (const group in rankingGroups) {
      if (
        rankingGroups[group as unknown as 1 | 2 | 3 | 4].some(
          r => r.player.id === playerId,
        )
      ) {
        return parseInt(group);
      }
    }
    return null;
  };

  useEffect(() => {
    const currentPeriod = currentSeason?.periods.find(p => !p.end);
    if (!currentPeriod || !currentSeason) return;

    const newRanking = calculateNewRanking(
      currentPeriod,
      currentSeason.ranking,
    );

    setLiveRanking(newRanking);
  }, [currentSeason]);

  useEffect(() => {
    if (!currentSeason || !currentSeason.ranking) return;

    setRankingPlayer(
      currentSeason.ranking.find(r => r.player.id === player?.id),
    );

    let ranking = [...currentSeason.ranking];
    if (live) {
      ranking = liveRanking;
    }

    const groupSize = ranking.length > 4 ? Math.round(ranking.length / 4) : 1;
    const newrankingGroups: rankingGroupsType = {1: [], 2: [], 3: [], 4: []};
    ranking.forEach((player, index) => {
      const group = Math.min(Math.floor(index / groupSize) + 1, 4);
      newrankingGroups[group as 1 | 2 | 3 | 4].push(player);
    });
    setRankingGroups(newrankingGroups);
  }, [currentSeason, player?.id, live, liveRanking]);

  // è possibile sfidare la seconda metà del gruppo precedente se si è nella prima metà del gruppo attuale, altrimenti si possono sfidare tutti quelli del gruppo precedente
  useEffect(() => {
    const playerGroupIndex = findPlayerGroup(rankingGroups, player?.id);
    const playerGroup = playerGroupIndex
      ? rankingGroups[playerGroupIndex as 1 | 2 | 3 | 4]
      : null;

    if (!playerGroup || !playerGroupIndex) return;

    if (playerGroupIndex > 1) {
      const prevGroup = rankingGroups[(playerGroupIndex - 1) as 1 | 2 | 3];
      const prevGroupMiddlePosition =
        prevGroup[Math.floor(prevGroup.length / 2)].position;
      const lastChangellablePosition =
        playerGroup[playerGroup.length - 1].position;

      const playerIndexInGroup = playerGroup.findIndex(
        r => r.player.id === player?.id,
      );

      const start =
        playerIndexInGroup < Math.floor(playerGroup.length / 2)
          ? prevGroupMiddlePosition
          : playerGroup[0].position;

      setChallengeableRange([start, lastChangellablePosition]);
    } else {
      setChallengeableRange([
        playerGroup[0].position,
        playerGroup[playerGroup.length - 1].position,
      ]);
    }
  }, [rankingGroups, player?.id]);

  useEffect(() => {
    setEmpty((currentSeason?.ranking.length ?? 0) === 0);
  }, [currentSeason?.ranking]);

  return {
    challengeableRange,
    rankingPlayer,
    rankingGroups,
    empty,
    liveRanking,
  };
};

export {useRanking, type rankingGroupsType};
