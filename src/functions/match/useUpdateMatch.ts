import {useState} from "react";
import type {Season} from "../../domain/types";
import {
  updateMatchResult as coreupdateMatchResult,
  resetMatchApproval as coreResetMatchApproval,
  updateMatchDate as coreUpdateMatchDate,
  updateMatchStatus as coreUpdateMatchStatus,
} from "./core";

const useUpdateMatch = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(undefined);
    setSuccess(false);
  };

  const updateMatchResult = async (
    season: Season,
    mId: string,
    result: string,
    pid1Approved: boolean,
    pid2Approved: boolean,
    complete?: boolean,
  ) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreupdateMatchResult(
        season,
        mId,
        result,
        pid1Approved,
        pid2Approved,
        complete,
      );
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetMatchApproval = async (season: Season, mId: string) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreResetMatchApproval(season, mId);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchDate = async (season: Season, mId: string, date: Date) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreUpdateMatchDate(season, mId, date);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (
    season: Season,
    mId: string,
    status: "approved" | "rejected",
  ) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreUpdateMatchStatus(season, mId, status);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    updateMatchResult,
    resetMatchApproval,
    updateMatchDate,
    updateMatchStatus,
    clear,
  };
};

export {useUpdateMatch};
