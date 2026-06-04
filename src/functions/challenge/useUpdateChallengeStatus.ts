import {useState} from "react";
import type {Season} from "../../domain/types";
import {updateChallengeStatus as coreUpdateChallengeStatus} from "./core";

const useUpdateChallengeStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(undefined);
    setSuccess(false);
  };

  const updateChallengeStatus = async (
    season: Season,
    pid1: string,
    pid2: string,
    status: "approved" | "rejected",
  ) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreUpdateChallengeStatus(season, pid1, pid2, status);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, updateChallengeStatus, clear};
};

export {useUpdateChallengeStatus};
