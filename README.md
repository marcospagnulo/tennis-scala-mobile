# Tennis Scala Mobile

Dashboard amministrativa React per la gestione della Scala Mobile del circolo, aggiornata sulle differenze emerse dal PDF del regolamento.

## Stack

- React + TypeScript + Vite
- Material UI
- Firebase / Firestore

## Funzionalita incluse

- classifica reale e classifica live
- gruppi dinamici calcolati sulla classifica reale
- periodi di circa 3 settimane
- punteggio conforme al PDF
- validazione di sfide standard e irrevocabili
- gestione di partite terminate, non terminate e pari
- controllo obbligo minimo di una partita per periodo
- verifica ammissione alla fase finale
- layer Firebase pronto per Firestore

## Avvio

```bash
npm install
npm run dev
```

## Firebase

1. Copia `.env.example` in `.env`
2. Inserisci le variabili `VITE_FIREBASE_*`
3. Avvia l'app

Quando le variabili sono valorizzate, il file `src/lib/firebase.ts` inizializza Firestore e prepara le collection:

- `players`
- `periods`
- `challenges`
- `matches`
- `exclusions`

## Script

- `npm run dev`
- `npm run build`
- `npm run lint`
