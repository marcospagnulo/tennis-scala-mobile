import {useEffect, useState} from "react";
import {refreshRanking as coreReleteRanking} from "./core";
import type {Ranking, Season} from "../../domain/types";

const useRefreshRanking = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // unmount
  useEffect(() => {
    return () => {
      setLoading(false);
      setError(false);
      setSuccess(false);
    };
  }, []);

  const refreshRanking = async (season: Season, ranking: Ranking) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      await coreReleteRanking(season, ranking);
      setSuccess(true);
    } catch (error) {
      console.error("Error refreshing ranking:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, refreshRanking};
};

export {useRefreshRanking};
