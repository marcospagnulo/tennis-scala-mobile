import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {auth} from "../lib/firebase";
import {useEffect, useState} from "react";
import type {role, User} from "../domain/types";

const useAuth = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

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

  return {user, handleLogout};
};

export {useAuth};
