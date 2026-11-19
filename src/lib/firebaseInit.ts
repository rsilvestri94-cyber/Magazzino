import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../configurazione";

// Caricato solo quando la condivisione è attiva: in modalità locale Firebase non viene nemmeno scaricato.
let pronto: Promise<Firestore> | null = null;

export function apriDatabase(): Promise<Firestore> {
    if (!pronto) {
        pronto = (async () => {
            const app = initializeApp(FIREBASE_CONFIG);
            const db = initializeFirestore(app, {
                ignoreUndefinedProperties: true,
                // copia locale: il sito si apre subito e funziona anche se la rete va e viene
                localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
            });
            const auth = getAuth(app);
            await auth.authStateReady();
            if (!auth.currentUser) await signInAnonymously(auth);
            return db;
        })();
        pronto.catch(() => (pronto = null)); // al prossimo tentativo riprova da capo
    }
    return pronto;
}
