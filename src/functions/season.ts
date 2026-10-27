import {doc, runTransaction, type UpdateData} from "firebase/firestore";
import type {Season} from "../domain/types";
import {collections, firestore} from "../lib/firebase";

/**
 * Aggiorna una stagione dentro una transazione: la modifica viene calcolata
 * sempre sull'ultima versione salvata, così due aggiornamenti concorrenti
 * (es. due giocatori che approvano il risultato) non si sovrascrivono.
 * Vengono scritti solo i campi restituiti da `update`.
 *
 * @param seasonId id della stagione da aggiornare
 * @param update funzione pura che riceve la stagione e restituisce i campi modificati
 */
const updateSeason = async (
  seasonId: string | undefined,
  update: (season: Season) => Partial<Season>,
) => {
  if (!collections || !firestore || !seasonId) return;

  const seasonDoc = doc(collections.seasons, seasonId);
  await runTransaction(firestore, async transaction => {
    const snapshot = await transaction.get(seasonDoc);
    if (!snapshot.exists()) {
      throw new Error("Stagione non trovata");
    }
    const season = {...snapshot.data(), id: snapshot.id};
    transaction.update(seasonDoc, update(season) as UpdateData<Season>);
  });
};

export {updateSeason};
