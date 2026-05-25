import {createContext, useContext, useEffect, useState} from "react";
import {collections} from "../lib/firebase";
import {onSnapshot} from "firebase/firestore";
import type {Season} from "../domain/types";

export type AppContextType = {
  season?: Season;
  setSeason: (season: Season) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export const AppProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [season, setSeason] = useState<Season | undefined>(undefined);

  useEffect(() => {
    if (!collections) return;

    const unsubscribe = onSnapshot(collections?.seasons, snapshot => {
      const seasons = snapshot.docs.map(
        doc => ({...doc.data(), id: doc.id}) as Season,
      );
      const lastSeason = seasons.sort(
        (a, b) => b.startDate.seconds - a.startDate.seconds,
      )[0];
      if (lastSeason) {
        setSeason(lastSeason);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{season, setSeason}}>
      {children}
    </AppContext.Provider>
  );
};
