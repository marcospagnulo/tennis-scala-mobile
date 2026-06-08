import {useState} from "react";
import type {Season} from "../../domain/types";
import {updateMatchStatus as coreUpdateMatchStatus} from "./core";

const useUpdateMatchStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(undefined);
    setSuccess(false);
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

  return {loading, error, success, updateMatchStatus, clear};
};

export {useUpdateMatchStatus};
