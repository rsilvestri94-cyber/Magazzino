// Colori dei magazzini (colonna MRP), per riconoscere a colpo d'occhio per quale magazzino si stampa.
// Ogni codice riceve sempre lo stesso colore dalla tavolozza.

const TAVOLOZZA = ["#0052a5", "#2f9e6e", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#4f46e5"];

export function coloreMagazzino(mrp?: string): string {
    const m = String(mrp || "").trim();
    if (!m) return "#94a3b8"; // riga senza magazzino
    let h = 0;
    for (const c of m) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return TAVOLOZZA[h % TAVOLOZZA.length];
}

export function etichettaMagazzino(mrp?: string): string {
    const m = String(mrp || "").trim();
    if (!m) return "Senza magazzino";
    return `MRP ${m.slice(-4)}`;
}
