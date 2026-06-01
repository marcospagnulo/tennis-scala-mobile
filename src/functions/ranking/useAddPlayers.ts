import {useState} from "react";
import {addPlayers as coreAddPlayers} from "./core";
import type {Player, Season} from "../../domain/types";

const useAddPlayers = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const addPlayers = async (season: Season, players: Player[]) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      await coreAddPlayers(season, players);
      setSuccess(true);
    } catch (error) {
      console.error("Error adding players:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, addPlayers};
};

export {useAddPlayers};
