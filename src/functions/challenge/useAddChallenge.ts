import {useState} from "react";
import type {Season} from "../../domain/types";
import {addChallenge as coreAddChallenge} from "./core";

const useAddChallenge = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(undefined);
    setSuccess(false);
  };

  const addChallenge = async (
    season: Season,
    player1Id: string,
    player2Id: string,
    date: Date,
  ) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      await coreAddChallenge(season, player1Id, player2Id, date);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, addChallenge, clear};
};

export {useAddChallenge};
