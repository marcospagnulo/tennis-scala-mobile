import {useState} from "react";
import type {Season} from "../../domain/types";
import {
  updateMatchResult as coreupdateMatchResult,
  resetMatchApproval as coreResetMatchApproval,
} from "./core";

const useUpdateMatchResult = () => {
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

  return {
    loading,
    error,
    success,
    updateMatchResult,
    resetMatchApproval,
    clear,
  };
};

export {useUpdateMatchResult};
