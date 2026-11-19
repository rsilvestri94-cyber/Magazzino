import { useCallback } from "react";
import { nuovoId } from "./locale";
import { useLista } from "./condivisione";
import { conPassi, descriviModifiche, descriviNuovo } from "./pickingPassi";
import type { Picking, PickingDati } from "../types/picking";

// Picking (nel browser o condivisi con la squadra), con lo storico dei passi (chi, cosa, quando).
export function usePickingLocale(nome: string) {
    const [voci, setVoci] = useLista<Picking>("picking");
    return {
        voci,
        salva: useCallback(
            (id: string | null, dati: PickingDati) =>
                setVoci(l =>
                    id
                        ? l.map(x => (x.id === id ? { ...x, ...dati, storico: conPassi(x.storico, descriviModifiche(x, dati), nome) } : x))
                        : [...l, { ...dati, id: nuovoId(), storico: conPassi([], [descriviNuovo(dati)], nome), author: nome, date: new Date().toISOString() }],
                ),
            [setVoci, nome],
        ),
        aggiorna: useCallback(
            (id: string, campi: Partial<PickingDati>) =>
                setVoci(l => l.map(x => (x.id === id ? { ...x, ...campi, storico: conPassi(x.storico, descriviModifiche(x, { ...x, ...campi }), nome) } : x))),
            [setVoci, nome],
        ),
        elimina: useCallback((id: string) => setVoci(l => l.filter(x => x.id !== id)), [setVoci]),
    };
}
