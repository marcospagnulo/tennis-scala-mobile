import {useState} from "react";
import {closePeriod as coreClosePeriod} from "./core";
import type {Season} from "../../domain/types";

const useClosePeriod = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const clear = () => {
    setLoading(false);
    setError(false);
    setSuccess(false);
  };
  const closePeriod = async (season: Season) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      await coreClosePeriod(season);
      setSuccess(true);
    } catch (error) {
      console.error("Error closing period:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, closePeriod, clear};
};

export {useClosePeriod};
