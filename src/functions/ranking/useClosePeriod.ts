import {useState} from "react";
import {closePeriod as coreClosePeriod} from "./core";
import type {Season} from "../../domain/types";

const useClosePeriod = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };
  const closePeriod = async (season: Season) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await coreClosePeriod(season);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, closePeriod, clear};
};

export {useClosePeriod};
