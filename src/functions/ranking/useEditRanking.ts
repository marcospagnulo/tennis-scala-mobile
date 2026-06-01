import {useState} from "react";
import {editRanking as coreEditRanking} from "./core";
import type {Ranking, Season} from "../../domain/types";

const useEditRanking = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const editRanking = async (
    season: Season,
    ranking: Ranking,
    field: string,
    value: string | number,
  ) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      await coreEditRanking(season, ranking, field, value);
      setSuccess(true);
    } catch (error) {
      console.error("Error editing ranking:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, editRanking};
};

export {useEditRanking};
