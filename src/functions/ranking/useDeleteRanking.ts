import {useState} from "react";
import {deleteRanking as coreDeleteRanking} from "./core";
import type {Ranking, Season} from "../../domain/types";

const useDeleteRanking = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const deleteRanking = async (season: Season, ranking: Ranking) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      await coreDeleteRanking(season, ranking);
      setSuccess(true);
    } catch (error) {
      console.error("Error deleting ranking:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, deleteRanking};
};

export {useDeleteRanking};
