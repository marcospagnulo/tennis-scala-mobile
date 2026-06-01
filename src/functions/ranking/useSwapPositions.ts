import {useState} from "react";
import {swapPositions as coreSwapPosition} from "./core";
import type {Season} from "../../domain/types";

const useSwapPositions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const swapPositions = async (season: Season, pos1: number, pos2: number) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      await coreSwapPosition(season, pos1, pos2);
      setSuccess(true);
    } catch (error) {
      console.error("Error swapping positions:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {loading, error, success, swapPositions};
};

export {useSwapPositions};
