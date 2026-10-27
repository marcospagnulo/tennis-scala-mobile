import {
  doc,
  runTransaction,
  type DocumentReference,
  type Firestore,
  type UpdateData,
} from "firebase/firestore";
import type {Season} from "../domain/types";
import {firestore} from "../lib/firebase";

/**
 * Aggiorna una stagione dentro una transazione: la modifica viene calcolata
 * sempre sull'ultima versione salvata, così due aggiornamenti concorrenti
 * (es. due giocatori che approvano il risultato) non si sovrascrivono.
 * Vengono scritti solo i campi restituiti da `update`.
 *
 * @param db istanza Firestore
 * @param seasonId id della stagione da aggiornare
 * @param update funzione pura che riceve la stagione e restituisce i campi modificati
 */
const updateSeasonDoc = async (
  db: Firestore,
  seasonId: string,
  update: (season: Season) => Partial<Season>,
) => {
  const seasonDoc = doc(db, "seasons", seasonId) as DocumentReference<
    Season,
    Season
  >;
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(seasonDoc);
    if (!snapshot.exists()) {
      throw new Error("Stagione non trovata");
    }
    const season = {...snapshot.data(), id: snapshot.id};
    transaction.update(seasonDoc, update(season) as UpdateData<Season>);
  });
};

const updateSeason = async (
  seasonId: string | undefined,
  update: (season: Season) => Partial<Season>,
) => {
  if (!firestore || !seasonId) return;
  await updateSeasonDoc(firestore, seasonId, update);
};

export {updateSeason, updateSeasonDoc};
