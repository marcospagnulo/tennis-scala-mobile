import {createContext, useContext, useEffect, useState} from "react";
import {collections} from "../lib/firebase";
import {
  addDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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
import {useQueryCollection} from "../functions";
import dayjs from "dayjs";

export type AppContextType = {
  user?: User | null;
  player?: Player | null;
  setPlayer: (player: Player) => void;
  appLoading: boolean;
  setAppLoading: (loading: boolean) => void;
  currentSeason?: Season;
  setCurrentSeasonId: (id: string) => void;
  handleLogout: () => Promise<void>;
  mobile: boolean;
  seasons: Season[];
  currentSeasonExpired: boolean;
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
  const [user, setUser] = useState<User | null | undefined>();
  const [player, setPlayer] = useState<Player | null | undefined>();
  const [currentSeasonId, setCurrentSeasonId] = useState<string>();
  const [currentSeason, setCurrentSeason] = useState<Season>();
  const [mobile, setMobile] = useState<boolean>(downMd);
  const [appLoading, setAppLoading] = useState<boolean>(true);

  const {items: seasons, loading: seasonLoading} = useQueryCollection<Season>({
    collection: collections?.seasons,
    sort: [{field: "start", direction: "desc"}],
    skip: user === undefined, // Skip query until auth state is resolved
  });

  useEffect(() => {
    setMobile(downMd);
  }, [downMd]);

  const ensurePlayer = async (user: User | null) => {
    if (!user || !collections) return;

    try {
      // First, try to find player by userId (already associated)
      let playerQuery = query(
        collections.players,
        where("userId", "==", user.id),
      );
      let snapshot = await getDocs(playerQuery);

      if (!snapshot.empty) {
        // Player already associated
        const playerData = snapshot.docs[0].data() as Player;
        setPlayer({...playerData, id: snapshot.docs[0].id});
        return;
      }

      // Second, try to find player by email without userId (created by admin)
      playerQuery = query(
        collections.players,
        where("email", "==", user.email),
      );
      snapshot = await getDocs(playerQuery);

      if (!snapshot.empty) {
        // Found player created by admin, associate with current user
        const playerDoc = snapshot.docs[0];
        const playerData = playerDoc.data() as Player;

        // Update with userId
        await updateDoc(doc(collections.players, playerDoc.id), {
          userId: user.id,
        });

        setPlayer({...playerData, id: playerDoc.id, userId: user.id});
        return;
      }

      // No player found, create new one
      const newPlayer: WithFieldValue<Partial<Player>> = {
        userId: user.id,
        email: user.email,
        createdAt: serverTimestamp(),
      };
      const newPlayerDoc = await addDoc(collections.players, newPlayer);
      setPlayer({...(newPlayer as Player), id: newPlayerDoc.id});
    } catch (error) {
      console.error("Error in ensurePlayer:", error);
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
        try {
          let user: User | null = null;
          if (firebaseUser) {
            const claims = (await firebaseUser.getIdTokenResult()).claims;
            user = {
              id: firebaseUser.uid,
              displayName: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              role: claims.role ? (claims.role as role) : "player",
            };
          }
          setUser(user);
          ensurePlayer(user);
        } catch (error) {
          console.error("Error processing auth state change:", error);
          setUser(null);
        } finally {
          setAppLoading(false);
        }
      },
      (error: Error) => {
        setAppLoading(false);
        console.error("Auth state change error:", error);
        setUser(null);
      },
    );
    return () => unsubscribe();
  }, []);

  // Refresh current season
  useEffect(() => {
    if (!collections || !currentSeasonId) return;

    const seasonDoc = doc(collections.seasons, currentSeasonId);
    const unsubscribe = onSnapshot(seasonDoc, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCurrentSeason({...data, id: snapshot.id} as Season);
      } else {
        setCurrentSeason(undefined);
      }
    });
    return () => unsubscribe();
  }, [currentSeasonId]);

  useEffect(() => {
    if (seasons.length > 0) {
      setCurrentSeasonId(seasons[0].id);
    }
  }, [seasons]);

  useEffect(() => {
    setAppLoading(seasonLoading);
  }, [seasonLoading]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setPlayer(undefined);
    }
  };

  return (
    <AppContext.Provider
      value={{
        mobile,
        user,
        player,
        setPlayer,
        currentSeason,
        setCurrentSeasonId,
        handleLogout,
        appLoading,
        setAppLoading,
        seasons,
        currentSeasonExpired: currentSeason
          ? dayjs(currentSeason.end.toDate()).isBefore(dayjs())
          : false,
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
