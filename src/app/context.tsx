import {createContext, useContext, useEffect, useState} from "react";
import {collections} from "../lib/firebase";
import {
  addDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type WithFieldValue,
} from "firebase/firestore";
import type {Player, role, Season, User} from "../domain/types";
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {auth} from "../lib/firebase";
import {useDownBreakpoint} from "../hooks/useDownBreakpoint";
import {Backdrop, CircularProgress} from "@mui/material";

export type AppContextType = {
  user?: User | null;
  player?: Player | null;
  setPlayer: (player: Player) => void;
  appLoading: boolean;
  setAppLoading: (loading: boolean) => void;
  season?: Season;
  setSeason: (season: Season) => void;
  handleLogout: () => Promise<void>;
  mobile: boolean;
  seasons: Season[];
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
  const downMd = useDownBreakpoint("md");
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [player, setPlayer] = useState<Player | null | undefined>(undefined);
  const [season, setSeason] = useState<Season | undefined>(undefined);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [mobile, setMobile] = useState<boolean>(downMd);
  const [appLoading, setAppLoading] = useState<boolean>(true);

  useEffect(() => {
    setMobile(downMd);
  }, [downMd]);

  const ensurePlayer = async (user: User | null) => {
    if (!user || !collections) return;

    const playerQuery = query(
      collections.players,
      where("userId", "==", user.id),
    );
    const snapshot = await getDocs(playerQuery);
    if (snapshot.empty) {
      const player: WithFieldValue<Player> = {
        id: undefined,
        userId: user.id,
        email: user.email,
        createdAt: serverTimestamp(),
      };
      const playerDoc = await addDoc(collections.players, player);
      setPlayer({...(player as Player), id: playerDoc.id});
    } else {
      const playerData = snapshot.docs[0].data() as Player;
      setPlayer({...playerData, id: snapshot.docs[0].id});
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      setAppLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        let user: User | null = null;
        if (firebaseUser) {
          const claims = (await firebaseUser.getIdTokenResult()).claims;
          user = {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            role: claims.role ? (claims.role as role) : "user",
          };
        }
        setUser(user);
        ensurePlayer(user);
      },
      (error: Error) => {
        setAppLoading(false);
        console.error("Auth state change error:", error);
        setUser(null);
      },
    );
    return () => unsubscribe();
  }, []);

  // Fetch current season after auth state has been resolved
  useEffect(() => {
    if (user === undefined) {
      return;
    }
    if (!collections) {
      setAppLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collections?.seasons, snapshot => {
      const seasons = snapshot.docs.map(
        doc => ({...doc.data(), id: doc.id}) as Season,
      );
      const lastSeason = seasons.sort(
        (a, b) => b.start.seconds - a.start.seconds,
      )[0];
      if (lastSeason) {
        setSeasons(seasons);
        setSeason(lastSeason);
      }
      setAppLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setPlayer(undefined);
    }
  };

  return (
    <AppContext.Provider
      value={{
        season,
        mobile,
        setSeason,
        user,
        player,
        setPlayer,
        handleLogout,
        appLoading,
        setAppLoading,
        seasons,
      }}>
      <Backdrop
        open={appLoading}
        sx={{zIndex: theme => theme.zIndex.drawer + 1}}>
        <CircularProgress />
      </Backdrop>
      {children}
    </AppContext.Provider>
  );
};
