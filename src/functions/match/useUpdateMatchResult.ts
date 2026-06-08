import {useState} from "react";
import type {Season} from "../../domain/types";
import {updateMatchResult as coreupdateMatchResult} from "./core";

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
      );
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, updateMatchResult, clear};
};

export {useUpdateMatchResult};
