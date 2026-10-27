import type {Season} from "../../domain/types";
import {updateSeason} from "../season";
import {
  addMatchToSeason,
  approveMatchResult as approveMatchResultInSeason,
  removeMatchFromSeason,
  resetMatchApproval as resetMatchApprovalInSeason,
  setMatchDate,
  setMatchResult,
  setMatchStatus,
} from "./logic";

const addMatch = (
  season: Season,
  player1Id: string,
  player2Id: string,
  date: Date,
  admin?: boolean,
) =>
  updateSeason(season.id, s =>
    addMatchToSeason(s, player1Id, player2Id, date, admin),
  );

const resetMatchApproval = (season: Season, mId: string) =>
  updateSeason(season.id, s => resetMatchApprovalInSeason(s, mId));

const updateMatchResult = (
  season: Season,
  mId: string,
  result: string,
  p1Approved: boolean,
  p2Approved: boolean,
  complete?: boolean,
) =>
  updateSeason(season.id, s =>
    setMatchResult(s, mId, result, p1Approved, p2Approved, complete),
  );

const approveMatchResult = (
  season: Season,
  mId: string,
  result: string,
  playerId: string,
) =>
  updateSeason(season.id, s =>
    approveMatchResultInSeason(s, mId, result, playerId),
  );

const updateMatchStatus = (
  season: Season,
  mId: string,
  status: "approved" | "rejected",
) => updateSeason(season.id, s => setMatchStatus(s, mId, status));

const updateMatchDate = (season: Season, mId: string, date: Date) =>
  updateSeason(season.id, s => setMatchDate(s, mId, date));

const deleteMatch = (season: Season, mId: string) =>
  updateSeason(season.id, s => removeMatchFromSeason(s, mId));

export {
  addMatch,
  updateMatchResult,
  approveMatchResult,
  updateMatchStatus,
  deleteMatch,
  resetMatchApproval,
  updateMatchDate,
};
