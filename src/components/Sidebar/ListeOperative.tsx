import type { VarianteLista } from "./TodoPanel";
export type { VarianteLista };

// Lista "Documenti esteri" della colonna di destra: come la To-Do ma senza priorità, una riga per voce.

export const PACKING: VarianteLista = {
    titolo: "Documenti esteri",
    segnaposto: "Nuovo documento estero...",
    vuoto: "Nessun documento. Aggiungine uno qui sopra.",
    vuotoDaFare: "Nessun documento da fare.",
    vuotoFatte: "Nessun documento completato.",
    guida: "packing",
    argomento: "packing",
    colonna: true,
    ancora: "sez-packing",
    semplice: true,
};
