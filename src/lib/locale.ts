import { useCallback, useEffect, useState } from "react";

// Tutti i dati del sito gemello restano nel browser di chi lo usa (localStorage).
// Niente server: chi apre il sito su un altro PC parte vuoto.

const PREFISSO = "hubgemello_";

export function leggiLocale<T>(chiave: string, iniziale: T): T {
    try {
        const t = localStorage.getItem(PREFISSO + chiave);
        return t ? (JSON.parse(t) as T) : iniziale;
    } catch {
        return iniziale;
    }
}

function scriviLocale<T>(chiave: string, valore: T) {
    try {
        localStorage.setItem(PREFISSO + chiave, JSON.stringify(valore));
    } catch {
        // spazio pieno o bloccato: il dato resta finché la pagina è aperta
    }
}

/** Come useState, ma il valore resta salvato nel browser. */
export function useLocale<T>(chiave: string, iniziale: T): [T, (v: T | ((p: T) => T)) => void] {
    const [valore, setValore] = useState<T>(() => leggiLocale(chiave, iniziale));
    useEffect(() => scriviLocale(chiave, valore), [chiave, valore]);
    // se lo stesso sito è aperto in un'altra scheda, si allinea
    useEffect(() => {
        const su = (e: StorageEvent) => {
            if (e.key === PREFISSO + chiave && e.newValue) {
                try {
                    setValore(JSON.parse(e.newValue) as T);
                } catch {
                    /* valore non leggibile: si ignora */
                }
            }
        };
        window.addEventListener("storage", su);
        return () => window.removeEventListener("storage", su);
    }, [chiave]);
    return [valore, useCallback((v: T | ((p: T) => T)) => setValore(v), [])];
}

export const nuovoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
