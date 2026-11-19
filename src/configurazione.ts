// Configurazione del progetto Firebase per condividere le liste con la squadra.
// Dove trovarla: console Firebase → ingranaggio "Impostazioni progetto" → "Le tue app" → app web → "Config".
// Questi valori non sono segreti (finiscono comunque nel sito): l'accesso ai dati è protetto
// dal codice squadra e dalle regole di Firestore.
// Se restano vuoti, il sito salva tutto solo nel browser di ognuno.
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDs0pKjqFp12CpHbfdt54KK0mfHzi6GZ9E",
    authDomain: "magazzino-52c8c.firebaseapp.com",
    projectId: "magazzino-52c8c",
    storageBucket: "magazzino-52c8c.firebasestorage.app",
    messagingSenderId: "67412682467",
    appId: "1:67412682467:web:e358d97b837fdb45c6c7d6",
};

/** Lunghezza minima del codice squadra (la stessa è controllata dalle regole di Firestore). */
export const CODICE_MIN = 10;
