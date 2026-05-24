import type {
  Challenge,
  ChallengeValidation,
  GroupedRanking,
  Match,
  Player,
  RankedPlayer,
  RankingMode,
  RuleConfig,
} from "./types";

const pointsFormatter = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getDayNumber(value: string) {
  const date = new Date(value);

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function differenceInDays(left: string, right: string) {
  return Math.round((getDayNumber(left) - getDayNumber(right)) / 86_400_000);
}

function pairIncludesPlayers(
  match: Match,
  playerId: string,
  opponentId: string,
) {
  return (
    (match.homePlayerId === playerId && match.awayPlayerId === opponentId) ||
    (match.homePlayerId === opponentId && match.awayPlayerId === playerId)
  );
}

export function formatPoints(value: number) {
  return pointsFormatter.format(value);
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function getRankedPlayers(
  players: Player[],
  matches: Match[],
): RankedPlayer[] {
  return players.map(player => {
    const currentPeriodMatches = matches.filter(
      match =>
        match.homePlayerId === player.id || match.awayPlayerId === player.id,
    );
    const currentPeriodPoints = currentPeriodMatches.reduce(
      (total, match) => total + (match.pointsAwarded[player.id] ?? 0),
      0,
    );

    return {
      ...player,
      currentPeriodMatches: currentPeriodMatches.length,
      currentPeriodPoints,
      livePoints: player.realPoints + currentPeriodPoints,
      totalMatches: player.historicalMatches + currentPeriodMatches.length,
    };
  });
}

export function sortRanking(players: RankedPlayer[], mode: RankingMode) {
  const scoreKey = mode === "real" ? "realPoints" : "livePoints";

  return [...players].sort((left, right) => {
    if (right[scoreKey] !== left[scoreKey]) {
      return right[scoreKey] - left[scoreKey];
    }

    return left.name.localeCompare(right.name, "it");
  });
}

export function buildGroups(
  players: RankedPlayer[],
  mode: RankingMode,
  targetGroupSize: number,
) {
  const ranking = sortRanking(players, mode);
  const groupCount = Math.max(1, Math.ceil(ranking.length / targetGroupSize));
  const groups: GroupedRanking[] = [];
  let cursor = 0;

  for (let index = 0; index < groupCount; index += 1) {
    const remainingPlayers = ranking.length - cursor;
    const remainingGroups = groupCount - index;
    const groupSize = Math.ceil(remainingPlayers / remainingGroups);
    const nextPlayers = ranking.slice(cursor, cursor + groupSize);

    groups.push({
      label: `Gruppo ${index + 1}`,
      players: nextPlayers,
    });

    cursor += groupSize;
  }

  return groups;
}

function buildGroupIndex(groups: GroupedRanking[]) {
  const groupIndex = new Map<string, number>();

  groups.forEach((group, groupPosition) => {
    group.players.forEach(player => {
      groupIndex.set(player.id, groupPosition);
    });
  });

  return groupIndex;
}

function isBoundaryPlayer(
  playerId: string,
  group: GroupedRanking,
  boundarySize: number,
  edge: "top" | "bottom",
) {
  const slice =
    edge === "top"
      ? group.players.slice(0, boundarySize)
      : group.players.slice(-boundarySize);

  return slice.some(player => player.id === playerId);
}

function canChallengeAcrossGroups(
  challengerId: string,
  opponentId: string,
  groups: GroupedRanking[],
  boundarySize: number,
) {
  const groupIndex = buildGroupIndex(groups);
  const challengerGroup = groupIndex.get(challengerId);
  const opponentGroup = groupIndex.get(opponentId);

  if (challengerGroup === undefined || opponentGroup === undefined) {
    return false;
  }

  if (challengerGroup === opponentGroup) {
    return true;
  }

  if (Math.abs(challengerGroup - opponentGroup) !== 1) {
    return false;
  }

  const upperGroupIndex = Math.min(challengerGroup, opponentGroup);
  const lowerGroupIndex = Math.max(challengerGroup, opponentGroup);
  const upperGroup = groups[upperGroupIndex];
  const lowerGroup = groups[lowerGroupIndex];

  return (
    (isBoundaryPlayer(challengerId, upperGroup, boundarySize, "bottom") &&
      isBoundaryPlayer(opponentId, lowerGroup, boundarySize, "top")) ||
    (isBoundaryPlayer(opponentId, upperGroup, boundarySize, "bottom") &&
      isBoundaryPlayer(challengerId, lowerGroup, boundarySize, "top"))
  );
}

export function evaluateChallenge(
  challenge: Challenge,
  players: Player[],
  matches: Match[],
  rules: RuleConfig,
): ChallengeValidation {
  const rankedPlayers = getRankedPlayers(players, matches);
  const realGroups = buildGroups(rankedPlayers, "real", rules.targetGroupSize);
  const playerById = new Map(players.map(player => [player.id, player]));
  const challenger = playerById.get(challenge.challengerId);
  const opponent = playerById.get(challenge.opponentId);
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (!challenger || !opponent) {
    return {
      challenge,
      status: "invalid",
      reasons: ["Giocatore non trovato nel dataset corrente."],
    };
  }

  if (challenger.status !== "active") {
    reasons.push(`${challenger.name} non e attivo nel periodo corrente.`);
  }

  if (opponent.status !== "active") {
    reasons.push(`${opponent.name} non e disponibile nel periodo corrente.`);
  }

  if (
    !canChallengeAcrossGroups(
      challenge.challengerId,
      challenge.opponentId,
      realGroups,
      rules.adjacentBoundarySize,
    )
  ) {
    reasons.push(
      "La sfida non rispetta i limiti tra stesso gruppo e giocatori di confine tra gruppi adiacenti.",
    );
  }

  const challengerMatches = matches.filter(
    match =>
      match.homePlayerId === challenger.id ||
      match.awayPlayerId === challenger.id,
  );
  const opponentMatches = matches.filter(
    match =>
      match.homePlayerId === opponent.id || match.awayPlayerId === opponent.id,
  );
  const pairMatches = matches.filter(match =>
    pairIncludesPlayers(match, challenger.id, opponent.id),
  );

  if (
    challengerMatches.length === 0 &&
    challenger.previousPeriodOpponentIds.includes(opponent.id)
  ) {
    reasons.push(
      "La prima partita del periodo del giocatore sfidante deve essere contro un avversario non incontrato nel periodo precedente.",
    );
  }

  if (pairMatches.length > 0) {
    const groupIndex = buildGroupIndex(realGroups);
    const challengerGroup = realGroups[groupIndex.get(challenger.id) ?? 0];
    const currentOpponents = new Set(
      challengerMatches.map(match =>
        match.homePlayerId === challenger.id
          ? match.awayPlayerId
          : match.homePlayerId,
      ),
    );
    const hasPlayedEntireGroup = challengerGroup.players
      .filter(player => player.id !== challenger.id)
      .every(player => currentOpponents.has(player.id));

    if (!hasPlayedEntireGroup) {
      reasons.push(
        "La coppia ha gia giocato nello stesso periodo e non risulta completato il giro del gruppo dello sfidante.",
      );
    }
  }

  if (challenge.type === "irrevocable") {
    if (
      rules.maxMatchesPerPeriod !== undefined &&
      opponentMatches.length >= rules.maxMatchesPerPeriod
    ) {
      reasons.push(
        "Lo sfidato ha gia raggiunto il numero massimo di incontri previsto per il periodo.",
      );
    }

    if (rules.maxMatchesPerPeriod === undefined) {
      warnings.push(
        "Il regolamento estratto non esplicita il numero massimo di incontri per periodo: parametro da configurare.",
      );
    }

    const hasBookedMatch = opponent.bookedMatchDates.some(
      date => getDayNumber(date) === getDayNumber(challenge.scheduledAt),
    );

    if (hasBookedMatch) {
      reasons.push(
        "Lo sfidato ha gia un incontro prenotato nella stessa data.",
      );
    }

    const opponentLatestMatch = opponentMatches
      .map(match => match.playedAt)
      .sort((left, right) => right.localeCompare(left))[0];

    if (
      opponentLatestMatch &&
      differenceInDays(challenge.scheduledAt, opponentLatestMatch) <
        rules.minimumRestDaysForIrrevocable
    ) {
      reasons.push(
        "Tra due partite dello sfidato devono trascorrere almeno 2 giorni.",
      );
    }
  }

  if (reasons.length > 0) {
    return {
      challenge,
      status: "invalid",
      reasons,
    };
  }

  if (warnings.length > 0) {
    return {
      challenge,
      status: "warning",
      reasons: warnings,
    };
  }

  return {
    challenge,
    status: "valid",
    reasons: ["Sfida coerente con i vincoli del regolamento."],
  };
}

export function isPlayerEligibleForFinal(
  player: RankedPlayer,
  rules: RuleConfig,
) {
  return (
    player.status === "active" &&
    player.totalMatches >= rules.minimumMatchesForFinalStage
  );
}
