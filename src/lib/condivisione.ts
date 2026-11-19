import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CODICE_MIN, FIREBASE_CONFIG } from "../configurazione";
import { leggiLocale, useLocale } from "./locale";

// Liste condivise con la squadra.
// - Senza configurazione Firebase, o senza codice squadra: tutto resta nel browser (come prima).
// - Con configurazione e codice: ogni lista sta in Firestore sotto squadre/<codice>/<lista>,
//   un documento per voce, e chiunque abbia lo stesso codice la vede aggiornata in tempo reale.

export const CONDIVISIONE_DISPONIBILE = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);

const PREFISSO = "hubgemello_";
const CHIAVE_CODICE = PREFISSO + "squadra";

/** Codice squadra in forma unica: minuscole, niente spazi né barre. */
export const pulisciCodice = (c: string) => c.trim().toLowerCase().replace(/[\s/]+/g, "");
export const codiceValido = (c: string) => pulisciCodice(c).length >= CODICE_MIN;

// --- codice squadra: un solo valore per tutta la pagina ---
const ascoltatori = new Set<() => void>();
const leggiCodice = () => leggiLocale<string>("squadra", "");
export function impostaCodice(c: string) {
    try {
        localStorage.setItem(CHIAVE_CODICE, JSON.stringify(pulisciCodice(c)));
    } catch {
        /* archivio bloccato */
    }
    ascoltatori.forEach(f => f());
}
function iscriviCodice(f: () => void) {
    ascoltatori.add(f);
    const su = (e: StorageEvent) => e.key === CHIAVE_CODICE && f();
    window.addEventListener("storage", su);
    return () => {
        ascoltatori.delete(f);
        window.removeEventListener("storage", su);
    };
}
export function useCodiceSquadra(): string {
    return useSyncExternalStore(iscriviCodice, leggiCodice, () => "");
}
/** true quando le liste sono condivise con la squadra */
export function useCondivisa(): boolean {
    const codice = useCodiceSquadra();
    return CONDIVISIONE_DISPONIBILE && codiceValido(codice);
}

// --- stato della connessione, per la pillola in alto ---
export type StatoSync = { tipo: "locale" | "collego" | "ok" | "offline" | "errore"; messaggio?: string };
let stato: StatoSync = { tipo: "locale" };
const ascoltaStato = new Set<() => void>();
function impostaStato(s: StatoSync) {
    if (s.tipo === stato.tipo && s.messaggio === stato.messaggio) return;
    stato = s;
    ascoltaStato.forEach(f => f());
}
export function useStatoSync(): StatoSync {
    return useSyncExternalStore(
        f => {
            ascoltaStato.add(f);
            return () => ascoltaStato.delete(f);
        },
        () => stato,
        () => stato,
    );
}

function spiegaErrore(e: unknown): string {
    const code = (e as { code?: string })?.code || "";
    if (code.includes("permission-denied")) return "Accesso negato: controlla il codice squadra o le regole di Firestore.";
    if (code.includes("operation-not-allowed") || code.includes("admin-restricted")) return "Accesso anonimo non attivo nel progetto Firebase.";
    if (code.includes("unavailable") || code.includes("network")) return "Nessuna connessione: le modifiche partono appena torna la rete.";
    return e instanceof Error ? e.message : String(e);
}

type ConData = { id: string };
type Salvata<T> = T & { _creato?: number };

/**
 * Come useLocale per una lista di voci con id, ma condivisa con la squadra quando possibile.
 * `recentiPrima`: true per le liste in cui le voci nuove stanno in cima (commenti).
 */
export function useLista<T extends ConData>(chiave: string, recentiPrima = false): [T[], (v: T[] | ((p: T[]) => T[])) => void] {
    const codice = useCodiceSquadra();
    const condivisa = CONDIVISIONE_DISPONIBILE && codiceValido(codice);
    const [locali, setLocali] = useLocale<T[]>(chiave, []);
    const [remote, setRemote] = useState<T[] | null>(null);
    const ultimo = useRef<T[]>([]);
    const creati = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (!condivisa) {
            setRemote(null);
            impostaStato({ tipo: "locale" });
            return;
        }
        let annullato = false;
        let stop = () => {};
        impostaStato({ tipo: "collego" });
        (async () => {
            try {
                const [{ apriDatabase }, fs] = await Promise.all([import("./firebaseInit"), import("firebase/firestore")]);
                const db = await apriDatabase();
                if (annullato) return;
                const col = fs.collection(db, "squadre", codice, chiave);
                const flagPassaggio = `passata_${chiave}_${codice}`;
                stop = fs.onSnapshot(
                    col,
                    { includeMetadataChanges: true },
                    snap => {
                        const voci = snap.docs.map(d => ({ ...(d.data() as Salvata<T>), id: d.id }));
                        voci.sort((a, b) => ((a._creato ?? 0) - (b._creato ?? 0)) * (recentiPrima ? -1 : 1));
                        creati.current = new Map(voci.map(v => [v.id, v._creato ?? 0]));
                        const pulite = voci.map(({ _creato, ...r }) => r as unknown as T);
                        ultimo.current = pulite;
                        setRemote(pulite);
                        impostaStato(snap.metadata.fromCache ? { tipo: "offline", messaggio: "Copia locale: si allinea appena c'è rete." } : { tipo: "ok" });

                        // Prima volta con questo codice: le voci già scritte su questo PC entrano nella lista della squadra
                        if (!snap.metadata.fromCache && !leggiLocale(flagPassaggio, false)) {
                            const presenti = new Set(pulite.map(v => v.id));
                            const daPortare = leggiLocale<T[]>(chiave, []).filter(v => v && v.id && !presenti.has(v.id));
                            if (daPortare.length) {
                                const b = fs.writeBatch(db);
                                const base = Date.now();
                                daPortare.forEach((v, i) => b.set(fs.doc(col, v.id), { ...v, _creato: base + i }));
                                b.commit().catch(e => impostaStato({ tipo: "errore", messaggio: spiegaErrore(e) }));
                            }
                            try {
                                localStorage.setItem(PREFISSO + flagPassaggio, "true");
                            } catch {
                                /* archivio bloccato */
                            }
                        }
                    },
                    e => impostaStato({ tipo: "errore", messaggio: spiegaErrore(e) }),
                );
            } catch (e) {
                impostaStato({ tipo: "errore", messaggio: spiegaErrore(e) });
            }
        })();
        return () => {
            annullato = true;
            stop();
        };
    }, [condivisa, codice, chiave, recentiPrima]);

    const imposta = useCallback(
        (v: T[] | ((p: T[]) => T[])) => {
            if (!condivisa) return setLocali(v);
            const prima = ultimo.current;
            const dopo = typeof v === "function" ? v(prima) : v;
            ultimo.current = dopo;
            setRemote(dopo); // si vede subito, poi arriva la conferma da Firestore

            const vecchie = new Map(prima.map(x => [x.id, JSON.stringify(x)]));
            const nuove = new Set(dopo.map(x => x.id));
            const cambiate = dopo.filter(x => vecchie.get(x.id) !== JSON.stringify(x));
            const tolte = prima.filter(x => !nuove.has(x.id));
            if (!cambiate.length && !tolte.length) return;

            (async () => {
                try {
                    const [{ apriDatabase }, fs] = await Promise.all([import("./firebaseInit"), import("firebase/firestore")]);
                    const db = await apriDatabase();
                    const col = fs.collection(db, "squadre", codice, chiave);
                    const b = fs.writeBatch(db);
                    let ora = Date.now();
                    cambiate.forEach(x => {
                        const creato = creati.current.get(x.id) ?? ora++;
                        creati.current.set(x.id, creato);
                        b.set(fs.doc(col, x.id), { ...x, _creato: creato });
                    });
                    tolte.forEach(x => b.delete(fs.doc(col, x.id)));
                    await b.commit();
                } catch (e) {
                    impostaStato({ tipo: "errore", messaggio: spiegaErrore(e) });
                }
            })();
        },
        [condivisa, codice, chiave, setLocali],
    );

    return [condivisa ? (remote ?? []) : locali, imposta];
}
