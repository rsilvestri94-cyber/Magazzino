import { coloreMagazzino, etichettaMagazzino } from "../../lib/magazzini";

/** Quante schede per magazzino, con il colore del magazzino. */
export function ChipMagazzini({ righe }: { righe: { mrp?: string }[] }) {
    const conta: Record<string, number> = {};
    righe.forEach(r => {
        const k = String(r.mrp || "");
        conta[k] = (conta[k] || 0) + 1;
    });
    return (
        <span className="flex flex-wrap gap-1.5">
            {Object.entries(conta).map(([mrp, n]) => (
                <span key={mrp} className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold text-white" style={{ background: coloreMagazzino(mrp) }}>
                    {etichettaMagazzino(mrp)} · {n}
                </span>
            ))}
        </span>
    );
}
