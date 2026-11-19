import { useEffect } from "react";

// Salti rapidi della barra laterale: porta a una sezione dell'Hub e, se è a fisarmonica, la apre.

const EVENTO = "hub:vai-a-sezione";

export function vaiASezione(id: string) {
    window.dispatchEvent(new CustomEvent<string>(EVENTO, { detail: id }));
    // Un frame dopo, così la sezione appena aperta ha già la sua altezza
    requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

export function tornaSu() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

export function vaiInFondo() {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
}

/** Da usare nelle sezioni a fisarmonica: si aprono quando la barra porta lì. */
export function useApriSuRichiesta(id: string | undefined, apri: () => void) {
    useEffect(() => {
        if (!id) return;
        const h = (e: Event) => {
            if ((e as CustomEvent<string>).detail === id) apri();
        };
        window.addEventListener(EVENTO, h);
        return () => window.removeEventListener(EVENTO, h);
    }, [id, apri]);
}
