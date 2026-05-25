import {getApp, getApps, initializeApp} from "firebase/app";
import {connectAuthEmulator, getAuth} from "firebase/auth";
import {
  collection,
  CollectionReference,
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";
import type {Player} from "../domain/types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

export const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseEnabled = missingFirebaseConfig.length === 0;

const firebaseApp = firebaseEnabled
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;

export const firestore = firebaseApp ? getFirestore(firebaseApp) : undefined;
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;

// --- NUOVA SEZIONE PER GLI EMULATORI ---
// Controlla se siamo in sviluppo e se la variabile d'ambiente VITE_USE_EMULATORS è 'true'
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  if (firestore) {
    connectFirestoreEmulator(firestore, "localhost", 8080);
    console.log("Firestore emulator connected");
  }
  if (auth) {
    connectAuthEmulator(auth, "http://localhost:9099");
    console.log("Auth emulator connected");
  }
}
// --- FINE NUOVA SEZIONE ---

export const collections = firestore
  ? {
      players: collection(firestore, "players") as CollectionReference<
        Player,
        Player
      >,
      periods: collection(firestore, "periods"),
      challenges: collection(firestore, "challenges"),
      matches: collection(firestore, "matches"),
      exclusions: collection(firestore, "exclusions"),
    }
  : undefined;
