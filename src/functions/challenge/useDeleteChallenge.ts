import {useState} from "react";
import type {Season} from "../../domain/types";
import {deleteChallenge as coreDeleteChallenge} from "./core";

const useDeleteChallenge = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(undefined);
    setSuccess(false);
  };

  const deleteChallenge = async (
    season: Season,
    player1Id: string,
    player2Id: string,
  ) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreDeleteChallenge(season, player1Id, player2Id);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, deleteChallenge, clear};
};

export {useDeleteChallenge};
