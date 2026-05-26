import {createContext, useContext, useEffect, useState} from "react";
import {collections} from "../lib/firebase";
import {onSnapshot} from "firebase/firestore";
import type {role, Season, User} from "../domain/types";
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {auth} from "../lib/firebase";

export type AppContextType = {
  season?: Season;
  setSeason: (season: Season) => void;
  user?: User | null;
  handleLogout: () => Promise<void>;
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
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [season, setSeason] = useState<Season | undefined>(undefined);

  // Fetch current season
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

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        let user: User | null = null;
        if (firebaseUser) {
          const claims = (await firebaseUser.getIdTokenResult()).claims;
          user = {
            displayName: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            role: claims.role ? (claims.role as role) : "user",
          };
        }
        setUser(user);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <AppContext.Provider value={{season, setSeason, user, handleLogout}}>
      {children}
    </AppContext.Provider>
  );
};
