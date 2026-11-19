import { colliDi, type Passo, type Picking, type PickingDati, type RigaMateriale } from "../types/picking";

// Ogni modifica a un picking diventa uno o più "passi" leggibili (chi, quando, cosa).
// Chi modifica li scrive nello storico del picking; gli altri li ricevono come notifica.

const MAX_STORICO = 60;

const CAMPI: [keyof PickingDati, string][] = [
    ["dn", "Documento"],
    ["destinazione", "Destinazione"],
    ["note", "Note"],
];

const chiaveRiga = (r: RigaMateriale) => (r.material || r.descrizione).toUpperCase();

/** Cosa è cambiato tra prima e dopo, in frasi brevi. */
export function descriviModifiche(prima: PickingDati, dopo: PickingDati): string[] {
    const out: string[] = [];

    if (!prima.paccoPronto && dopo.paccoPronto) out.push("📦 Collo pronto");
    if (prima.paccoPronto && !dopo.paccoPronto) out.push("↩ Collo pronto tolto");
    if (!prima.dnAllegata && dopo.dnAllegata) out.push("📄 Documento allegato");
    if (prima.dnAllegata && !dopo.dnAllegata) out.push("↩ Documento allegato tolto");

    if (prima.uscita !== dopo.uscita) out.push(dopo.uscita === "spedire" ? `🚚 Da spedire${dopo.localita ? ` a ${dopo.localita}` : ""}` : "📦 Solo preparazione");
    else if (dopo.uscita === "spedire" && prima.localita !== dopo.localita && dopo.localita) out.push(`🚚 Spedire a ${dopo.localita}`);

    for (const [k, nome] of CAMPI) {
        const a = String(prima[k] ?? "").trim();
        const b = String(dopo[k] ?? "").trim();
        if (a === b) continue;
        out.push(b ? `✏️ ${nome}: ${b}` : `✏️ ${nome} cancellato`);
    }

    // Materiali: aggiunti, tolti, quantità e VUI/Batch
    const vecchie = new Map(prima.righe.map(r => [chiaveRiga(r), r]));
    const nuove = new Map(dopo.righe.map(r => [chiaveRiga(r), r]));
    const aggiunte = [...nuove.keys()].filter(k => !vecchie.has(k));
    const tolte = [...vecchie.keys()].filter(k => !nuove.has(k));
    if (aggiunte.length) out.push(aggiunte.length === 1 ? `➕ Materiale ${aggiunte[0]}` : `➕ ${aggiunte.length} materiali aggiunti`);
    if (tolte.length) out.push(tolte.length === 1 ? `➖ Tolto ${tolte[0]}` : `➖ ${tolte.length} materiali tolti`);
    for (const [k, r] of nuove) {
        const v = vecchie.get(k);
        if (!v) continue;
        if (v.qty !== r.qty) out.push(`✏️ Quantità ${k}: ${r.qty} ${r.un}`.trim());
        if ((v.vui || "") !== (r.vui || "")) out.push(r.vui ? `✏️ VUI/Batch ${k}: ${r.vui}` : `✏️ VUI/Batch ${k} cancellato`);
    }

    if (!prima.completata && dopo.completata) out.push("✅ Picking completato");
    if (prima.completata && !dopo.completata) out.push("↩ Picking riaperto");

    const testoColli = (p: PickingDati) => colliDi(p).map(c => [c.dimensioni, c.peso].filter(Boolean).join(" · ")).filter(Boolean);
    const ca = testoColli(prima).join(" + ");
    const cb = testoColli(dopo).join(" + ");
    if (ca !== cb) {
        const n = testoColli(dopo).length;
        out.push(n ? `📐 ${n === 1 ? "1 collo" : `${n} colli`}: ${cb}` : "📐 Colli cancellati");
    }
    return out;
}

/** Il primo passo di un picking nuovo. */
export function descriviNuovo(d: PickingDati): string {
    const item = d.righe.length === 0 ? "" : d.righe.length === 1 ? "1 item" : `${d.righe.length} item`;
    const uscita = d.uscita === "spedire" ? `da spedire${d.localita ? ` a ${d.localita}` : ""}` : "solo preparazione";
    return [d.origine === "mano" ? "✍️ Nuovo picking scritto a mano" : "🆕 Nuovo picking", item, uscita].filter(Boolean).join(" · ");
}

/** Storico aggiornato con i nuovi passi (tiene gli ultimi MAX_STORICO). */
export function conPassi(storico: Passo[] | undefined, testi: string[], sigla: string, data = new Date().toISOString()): Passo[] {
    return [...(storico ?? []), ...testi.map(testo => ({ sigla, data, testo }))].slice(-MAX_STORICO);
}

const firmaPasso = (p: Passo) => `${p.data}|${p.sigla}|${p.testo}`;

/** I passi arrivati da altri (non da me) che non c'erano nella versione precedente. */
export function passiNuovi(prima: Picking | undefined, dopo: Picking, io: string): Passo[] {
    const visti = new Set((prima?.storico ?? []).map(firmaPasso));
    const me = io.toUpperCase();
    return (dopo.storico ?? []).filter(p => !visti.has(firmaPasso(p)) && p.sigla.toUpperCase() !== me);
}
