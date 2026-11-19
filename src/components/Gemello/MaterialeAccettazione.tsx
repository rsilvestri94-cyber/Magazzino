import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { nuovoId } from "../../lib/locale";
import { useLista } from "../../lib/condivisione";

// MATERIALE IN ACCETTAZIONE: documenti di materiale arrivato da accettare.
// Si aggiungono a mano (numero documento + magazzino), un clic li segna accettati
// (con "Annulla" per qualche secondo), la × li toglie.

interface Voce {
    id: string;
    documento: string;
    magazzino: string;
    note: string;
    inseritoDa: string;
    data: string;
    accettatoDa: string;
    dataAccettazione: string;
}

type Filtro = "dafare" | "fatte" | "tutte";

const breve = (iso: string) => (iso ? new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }) : "");

export function MaterialeAccettazione({ nome }: { nome: string }) {
    const [voci, setVoci] = useLista<Voce>("accettazione");
    const [filtro, setFiltro] = useState<Filtro>("dafare");
    const [documento, setDocumento] = useState("");
    const [magazzino, setMagazzino] = useState("");
    const [appena, setAppena] = useState<string[]>([]);
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const magazziniUsati = [...new Set(voci.map(v => v.magazzino).filter(Boolean))];
    const dafare = voci.filter(v => !v.accettatoDa);
    const fatte = voci.filter(v => v.accettatoDa);
    const visibili = filtro === "dafare" ? dafare : filtro === "fatte" ? fatte : [...dafare, ...fatte];

    const aggiungi = () => {
        const d = documento.trim();
        if (!d) return;
        setVoci(l => [
            ...l,
            { id: nuovoId(), documento: d, magazzino: magazzino.trim(), note: "", inseritoDa: nome, data: new Date().toISOString(), accettatoDa: "", dataAccettazione: "" },
        ]);
        setDocumento("");
    };

    const segna = (v: Voce) => {
        if (v.accettatoDa) {
            setVoci(l => l.map(x => (x.id === v.id ? { ...x, accettatoDa: "", dataAccettazione: "" } : x)));
            return;
        }
        setVoci(l => l.map(x => (x.id === v.id ? { ...x, accettatoDa: nome || "?", dataAccettazione: new Date().toISOString() } : x)));
        setAppena(a => [...a.filter(id => id !== v.id), v.id]);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setAppena([]), 8000);
    };

    const annulla = () => {
        const ids = new Set(appena);
        setVoci(l => l.map(x => (ids.has(x.id) ? { ...x, accettatoDa: "", dataAccettazione: "" } : x)));
        setAppena([]);
    };

    const elimina = (v: Voce) => {
        if (confirm(`Elimino il documento ${v.documento} dalla lista?`)) setVoci(l => l.filter(x => x.id !== v.id));
    };

    return (
        <div data-guida="migo" className="flex flex-col rounded-2xl border border-grey-line bg-white p-4 lg:h-72 lg:shrink-0">
            <div className="mb-2 flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-ink">Materiale in accettazione</h3>
            </div>

            <form
                className="flex gap-1.5"
                onSubmit={e => {
                    e.preventDefault();
                    aggiungi();
                }}
            >
                <input
                    value={documento}
                    onChange={e => setDocumento(e.target.value)}
                    placeholder="Documento…"
                    aria-label="Numero documento"
                    className="min-w-0 flex-1 rounded-lg border border-grey-line px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                />
                <input
                    value={magazzino}
                    onChange={e => setMagazzino(e.target.value)}
                    placeholder="Magazzino"
                    aria-label="Magazzino"
                    list="magazzini-usati"
                    className="w-28 min-w-0 rounded-lg border border-grey-line px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                />
                <datalist id="magazzini-usati">
                    {magazziniUsati.map(m => (
                        <option key={m} value={m} />
                    ))}
                </datalist>
                <button type="submit" aria-label="Aggiungi documento" className="flex shrink-0 items-center justify-center rounded-lg bg-blue-dark px-2.5 text-white hover:bg-blue-mid">
                    <Plus size={16} />
                </button>
            </form>

            <div className="mt-2 flex items-center gap-1.5">
                {(
                    [
                        ["dafare", "Da accettare", dafare.length],
                        ["fatte", "Accettati", fatte.length],
                        ["tutte", "Tutti", voci.length],
                    ] as const
                ).map(([id, et, n]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setFiltro(id)}
                        aria-pressed={filtro === id}
                        className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold transition ${
                            filtro === id ? "border-blue-dark bg-blue-dark text-white" : "border-grey-line bg-white text-ink/60 hover:border-blue-mid"
                        }`}
                    >
                        {et} <span className="opacity-60">{n}</span>
                    </button>
                ))}
            </div>

            {appena.length > 0 && (
                <div role="status" className="hub-entra mt-2 flex items-center gap-2 rounded-lg bg-blue-dark px-3 py-1.5 text-xs text-white">
                    <span className="min-w-0 flex-1 truncate">
                        {appena.length === 1 ? `Documento ${voci.find(v => v.id === appena[0])?.documento ?? ""} accettato` : `${appena.length} documenti accettati`}
                    </span>
                    <button type="button" onClick={annulla} className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 font-bold hover:bg-white/30">
                        Annulla
                    </button>
                </div>
            )}

            <ul className="mt-2 flex max-h-80 flex-col gap-1 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1">
                {visibili.length === 0 && (
                    <p className="py-4 text-center text-xs text-ink/40">
                        {voci.length === 0 ? "Nessun documento. Aggiungine uno qui sopra." : filtro === "fatte" ? "Nessun documento accettato." : "Nessun documento da accettare."}
                    </p>
                )}
                {visibili.map(v => {
                    const ok = !!v.accettatoDa;
                    return (
                        <li key={v.id} className={`flex items-start gap-2 rounded-lg p-2 transition hover:bg-grey-bg ${ok ? "opacity-60" : ""}`}>
                            <button
                                type="button"
                                onClick={() => segna(v)}
                                title={ok ? `Accettato da ${v.accettatoDa} il ${breve(v.dataAccettazione)} · clicca per riportarlo in Da accettare` : "Segna accettato"}
                                aria-label={ok ? `Riporta il documento ${v.documento} in Da accettare` : `Segna accettato il documento ${v.documento}`}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${ok ? "border-accent bg-accent" : "border-grey-line hover:border-accent"}`}
                            >
                                {ok && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                            <div className="min-w-0 flex-1">
                                <p className={`truncate font-heading text-sm font-semibold text-ink ${ok ? "line-through" : ""}`}>{v.documento}</p>
                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                    <span className="truncate text-[0.7rem] font-semibold text-blue-mid">{v.magazzino}</span>
                                    <span className="shrink-0 text-[0.65rem] text-ink/40">
                                        {ok ? `Accettato ${v.accettatoDa} · ${breve(v.dataAccettazione)}` : `${v.inseritoDa} · ${breve(v.data)}`}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => elimina(v)}
                                title="Elimina dalla lista"
                                aria-label={`Elimina il documento ${v.documento}`}
                                className="shrink-0 rounded p-1 text-ink/25 hover:bg-brand-red/10 hover:text-brand-red"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
