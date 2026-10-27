import {Timestamp} from "firebase/firestore";
import type {Match, Period, Season} from "../../domain/types";

const DEFAULT_MAX_MATCHES_PER_PERIOD = 3;

/**
 * Restituisce la chiave da usare per una nuova partita nella mappa del periodo.
 * Usa la chiave massima + 1 (non il numero di partite) così, dopo una
 * cancellazione, la nuova partita non sovrascrive una partita esistente.
 */
const nextMatchKey = (matches: Period["matches"]): number => {
  const keys = Object.keys(matches)
    .map(Number)
    .filter(k => !isNaN(k));
  return keys.length > 0 ? Math.max(...keys) + 1 : 1;
};

const findCurrentPeriodIndex = (season: Season): number =>
  season.periods?.findIndex(p => !p.end) ?? -1;

/**
 * Calcola i periodi della stagione con una nuova partita nel periodo corrente,
 * verificando i vincoli del regolamento. Non modifica la stagione ricevuta.
 */
const addMatchToSeason = (
  season: Season,
  player1Id: string,
  player2Id: string,
  date: Date,
  admin?: boolean,
): Pick<Season, "periods"> => {
  const periods = season.periods ?? [];
  const currentPeriodIndex = findCurrentPeriodIndex(season);
  if (currentPeriodIndex < 0) {
    throw new Error("Attendi l'inizio di un nuovo periodo");
  }
  if (player1Id === player2Id) {
    throw new Error("Un giocatore non può sfidare se stesso.");
  }
  const currentPeriod = periods[currentPeriodIndex];
  const matches = Object.values(currentPeriod.matches);

  // verifico che non ci siano già sfide tra questi due giocatori nel periodo corrente
  const existingMatch = matches.find(m => {
    const samePlayer =
      (m.pid1 === player1Id && m.pid2 === player2Id) ||
      (m.pid1 === player2Id && m.pid2 === player1Id);
    return samePlayer && m.status !== "rejected";
  });
  if (existingMatch) {
    throw new Error(
      "Puoi giocare contro lo stesso avversario solo una volta per periodo. Attendi la fine del periodo corrente per sfidarlo di nuovo.",
    );
  }

  // verifico che i giocatori non abbiamo sforato il limite di sfide per periodo
  const maxChallenges =
    season.maxMatchesPerPeriod || DEFAULT_MAX_MATCHES_PER_PERIOD;
  const countMatches = (pid: string) =>
    matches.filter(
      m => m.status !== "rejected" && (m.pid1 === pid || m.pid2 === pid),
    ).length;
  if (countMatches(player1Id) >= maxChallenges) {
    throw new Error(
      `Hai raggiunto il limite di ${maxChallenges} sfide per questo periodo. Attendi la fine del periodo corrente per sfidare nuovi avversari.`,
    );
  }
  if (countMatches(player2Id) >= maxChallenges) {
    throw new Error(
      `Il tuo avversario ha raggiunto il limite di ${maxChallenges} sfide per questo periodo. Attendi la fine del periodo corrente per sfidarlo di nuovo.`,
    );
  }

  const newMatch: Match = {
    id: `${Date.now()}`,
    pid1: player1Id,
    pid2: player2Id,
    result: {
      value: "",
      p1Approved: admin ?? false,
      p2Approved: admin ?? false,
    },
    status: admin ? "approved" : "pending",
    date: Timestamp.fromDate(date),
  };

  return {
    periods: periods.map((p, index) =>
      index === currentPeriodIndex
        ? {
            ...p,
            matches: {...p.matches, [nextMatchKey(p.matches)]: newMatch},
          }
        : p,
    ),
  };
};

/**
 * Calcola i periodi della stagione applicando `update` alla partita con id `mId`.
 * Non modifica la stagione ricevuta.
 */
const updateMatchInSeason = (
  season: Season,
  mId: string,
  update: (match: Match) => Match,
): Pick<Season, "periods"> => {
  let found = false;
  const periods = (season.periods ?? []).map(period => {
    const entry = Object.entries(period.matches).find(([, m]) => m.id === mId);
    if (!entry) return period;
    found = true;
    const [key, match] = entry;
    return {...period, matches: {...period.matches, [key]: update(match)}};
  });
  if (!found) {
    throw new Error("Match not found");
  }
  return {periods};
};

/**
 * Calcola i periodi della stagione senza la partita con id `mId`.
 * Non modifica la stagione ricevuta.
 */
const removeMatchFromSeason = (
  season: Season,
  mId: string,
): Pick<Season, "periods"> => {
  let found = false;
  const periods = (season.periods ?? []).map(period => {
    const entries = Object.entries(period.matches);
    const remaining = entries.filter(([, m]) => m.id !== mId);
    if (remaining.length === entries.length) return period;
    found = true;
    return {...period, matches: Object.fromEntries(remaining)};
  });
  if (!found) {
    throw new Error("Match not found");
  }
  return {periods};
};

const resetMatchApproval = (season: Season, mId: string) =>
  updateMatchInSeason(season, mId, match => ({
    ...match,
    status: "approved",
    result: {
      value: match.result?.value || "",
      p1Approved: false,
      p2Approved: false,
    },
  }));

const setMatchResult = (
  season: Season,
  mId: string,
  result: string,
  p1Approved: boolean,
  p2Approved: boolean,
  complete?: boolean,
) =>
  updateMatchInSeason(season, mId, match => ({
    ...match,
    status: complete || (p1Approved && p2Approved) ? "completed" : match.status,
    result: {value: result, p1Approved, p2Approved},
  }));

/**
 * Registra l'approvazione del risultato da parte di un giocatore della partita.
 * L'approvazione dell'avversario resta valida solo se il risultato non cambia;
 * quando entrambi hanno approvato la partita è completata.
 */
const approveMatchResult = (
  season: Season,
  mId: string,
  result: string,
  playerId: string,
) =>
  updateMatchInSeason(season, mId, match => {
    if (playerId !== match.pid1 && playerId !== match.pid2) {
      throw new Error("Solo i giocatori della partita possono approvarla.");
    }
    const sameResult = match.result?.value === result;
    const p1Approved =
      playerId === match.pid1 || (sameResult && !!match.result?.p1Approved);
    const p2Approved =
      playerId === match.pid2 || (sameResult && !!match.result?.p2Approved);
    return {
      ...match,
      status: p1Approved && p2Approved ? "completed" : match.status,
      result: {value: result, p1Approved, p2Approved},
    };
  });

const setMatchStatus = (
  season: Season,
  mId: string,
  status: "approved" | "rejected",
) => updateMatchInSeason(season, mId, match => ({...match, status}));

const setMatchDate = (season: Season, mId: string, date: Date) => {
  if (findCurrentPeriodIndex(season) < 0) {
    throw new Error("Attendi l'inizio di un nuovo periodo");
  }
  return updateMatchInSeason(season, mId, match => ({
    ...match,
    date: Timestamp.fromDate(date),
  }));
};

export {
  DEFAULT_MAX_MATCHES_PER_PERIOD,
  nextMatchKey,
  addMatchToSeason,
  updateMatchInSeason,
  removeMatchFromSeason,
  resetMatchApproval,
  setMatchResult,
  approveMatchResult,
  setMatchStatus,
  setMatchDate,
};
