import {useState} from "react";
import type {Season} from "../../domain/types";
import {deleteMatch as coreDeleteMatch} from "./core";

const useDeleteMatch = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(undefined);
    setSuccess(false);
  };

  const deleteMatch = async (season: Season, mId: string) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreDeleteMatch(season, mId);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, deleteMatch, clear};
};

export {useDeleteMatch};
