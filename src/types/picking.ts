// Picking: un documento da preparare (ed eventualmente spedire), con i materiali
// e i passi del magazziniere. Salvato nel browser.

export interface RigaMateriale {
    material: string;
    qty: string;
    un: string;
    descrizione: string;
    /** VUI o Batch, a mano */
    vui: string;
}

export type Uscita = "spedire" | "preparare";

/** un collo della spedizione: dimensioni e peso, scritti come si vuole (es. 40X30X20, 6KG) */
export interface Collo {
    dimensioni: string;
    peso: string;
}

/** chi ha messo la spunta e quando (ISO) */
export interface Firma {
    sigla: string;
    data: string;
}

export interface PickingDati {
    dn: string;
    /** codice destinatario (non usato nel gemello) */
    shipTo: string;
    /** es. "VAN 6140" (ricavato dal Ship-to) */
    destinazione: string;
    /** indirizzo del destinatario */
    indirizzo: string;
    /** dove spedire, es. "Melfi" */
    localita: string;
    uscita: Uscita;
    righe: RigaMateriale[];
    /** vecchio formato (un solo collo): oggi si usa "colli" */
    dimensioni: string;
    peso: string;
    colli?: Collo[];
    note: string;
    /** i tre passi del magazziniere: Collo pronto → Documento allegato → Completata */
    paccoPronto: Firma | null;
    dnAllegata: Firma | null;
    completata?: Firma | null;
    /** da dove arriva (nel gemello sempre scritto a mano) */
    origine?: "sap" | "mano";
}

/** un passo dello storico: chi ha fatto cosa e quando */
export interface Passo {
    sigla: string;
    data: string;
    testo: string;
}

export interface Picking extends PickingDati {
    id: string;
    storico?: Passo[];
    author: string;
    authorEmail?: string;
    date: string;
}

/** Completato = il magazziniere ha messo la terza spunta "Completata". */
export const completato = (p: Pick<PickingDati, "completata">) => !!p.completata;

/** I colli del picking (anche dai picking salvati col vecchio formato a collo unico). */
export function colliDi(p: Pick<PickingDati, "colli" | "dimensioni" | "peso">): Collo[] {
    if (p.colli && p.colli.length) return p.colli;
    return p.dimensioni || p.peso ? [{ dimensioni: p.dimensioni || "", peso: p.peso || "" }] : [];
}

export const PICKING_VUOTO: PickingDati = {
    dn: "",
    shipTo: "",
    destinazione: "",
    indirizzo: "",
    localita: "",
    uscita: "spedire",
    righe: [],
    dimensioni: "",
    peso: "",
    note: "",
    colli: [],
    paccoPronto: null,
    dnAllegata: null,
    completata: null,
};

/** Cosa va nella colonna Note del foglio Excel: "Spedire a Melfi" o "Solo preparazione", più le note. */
export function notaExcel(p: PickingDati): string {
    const base = p.uscita === "spedire" ? (p.localita ? `Spedire a ${p.localita}` : "Da spedire") : "Solo preparazione";
    return p.note ? `${base} · ${p.note}` : base;
}
