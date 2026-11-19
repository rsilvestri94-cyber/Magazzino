import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownToLine, ArrowUp, ArrowUpToLine, ChevronDown, ChevronUp, ClipboardCheck, ListChecks, Package, Plus, Printer, Settings2, Trash2, X } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";
import type { Tool } from "../../types/tool";
import { ToolIcon } from "../Tools/ToolIcon";
import { tornaSu, vaiASezione, vaiInFondo } from "../../lib/navigazione";

// Barra laterale fissa: "Inizio" in cima, "Fondo pagina" in fondo, in mezzo i pulsanti scelti da
// ognuno (strumenti o sezioni dell'Hub), da aggiungere, togliere e riordinare.
// La scelta è salvata con le preferenze dell'account, quindi segue la persona su ogni PC.

const MAX_PULSANTI = 8;
export const QUICK_PREDEFINITI = ["sez:stampa", "sez:picking", "sez:migo", "sez:packing"];

const SEZIONI: { key: string; target: string; label: string; icon: ReactNode }[] = [
    { key: "sez:stampa", target: "sez-stampa", label: "Stampa attività", icon: <Printer size={20} /> },
    { key: "sez:migo", target: "sez-migo", label: "Materiale in accettazione", icon: <ClipboardCheck size={20} /> },
    { key: "sez:packing", target: "sez-packing", label: "Documenti esteri", icon: <Package size={20} /> },
    { key: "sez:picking", target: "sez-picking", label: "Picking", icon: <ListChecks size={20} /> },
];

type Voce =
    | { tipo: "sezione"; key: string; label: string; icon: ReactNode; target: string }
    | { tipo: "tool"; key: string; label: string; tool: Tool };

function Etichetta({ testo }: { testo: string }) {
    return (
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {testo}
        </span>
    );
}

const BTN = "group relative flex h-11 w-11 items-center justify-center rounded-xl transition";
// Inizio e Fondo pagina: azzurro dell'Hub, per distinguerli dai pulsanti scelti
const ESTREMI = "bg-accent text-white shadow-sm hover:brightness-110";

export function QuickRail({ tools, quick, onSave }: { tools: Tool[]; quick?: string[]; onSave: (q: string[]) => void }) {
    const { lang } = useI18n();
    const [modifica, setModifica] = useState(false);
    const [scrollato, setScrollato] = useState(false);

    useEffect(() => {
        const h = () => setScrollato(window.scrollY > 400);
        h();
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);

    const scelti = (quick ?? QUICK_PREDEFINITI).filter(Boolean).slice(0, MAX_PULSANTI);

    const risolvi = (key: string): Voce | null => {
        const sez = SEZIONI.find(s => s.key === key);
        if (sez) return { tipo: "sezione", ...sez };
        if (key.startsWith("tool:")) {
            const tool = tools.find(t => t.key === key.slice(5));
            if (tool) return { tipo: "tool", key, label: tool.title[lang], tool };
        }
        return null;
    };

    return (
        <>
            {/* PC: barra a sinistra, sempre visibile */}
            <nav
                aria-label="Accesso rapido"
                className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl bg-blue-dark p-1.5 shadow-xl shadow-blue-dark/25 md:flex"
            >
                <button type="button" onClick={tornaSu} className={`${BTN} ${ESTREMI}`} aria-label="Inizio">
                    <ArrowUpToLine size={20} />
                    <Etichetta testo="Inizio pagina" />
                </button>
                <span className="my-0.5 h-px w-7 bg-white/20" />
                <div data-guida="barra-pulsanti" className="flex flex-col items-center gap-1.5">
                {scelti.map(key => {
                    const v = risolvi(key);
                    if (!v) return null; // strumento eliminato dalla griglia
                    if (v.tipo === "tool" && !v.tool.url)
                        return (
                            <span
                                key={v.key}
                                tabIndex={0}
                                className={`${BTN} bg-white/60`}
                                style={{ color: v.tool.color || "#0052a5" }}
                                aria-label={v.label + " (link da inserire)"}
                            >
                                <ToolIcon icon={v.tool.icon} className="h-5 w-5" />
                                <Etichetta testo={v.label + " · link da inserire"} />
                            </span>
                        );
                    if (v.tipo === "tool")
                        return (
                            <a
                                key={v.key}
                                href={v.tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${BTN} bg-white hover:scale-105`}
                                style={{ color: v.tool.color || "#0052a5" }}
                                aria-label={v.label}
                            >
                                <ToolIcon icon={v.tool.icon} className="h-5 w-5" />
                                <Etichetta testo={v.label + " ↗"} />
                            </a>
                        );
                    return (
                        <button key={v.key} type="button" onClick={() => vaiASezione(v.target)} className={`${BTN} bg-white/10 text-white hover:bg-white/20`} aria-label={v.label}>
                            {v.icon}
                            <Etichetta testo={v.label} />
                        </button>
                    );
                })}
                {scelti.length === 0 && (
                    <button
                        type="button"
                        onClick={() => setModifica(true)}
                        className={`${BTN} border border-dashed border-white/30 text-white/50 hover:border-white/60 hover:text-white`}
                        aria-label="Aggiungi un pulsante"
                    >
                        <Plus size={18} />
                        <Etichetta testo="Aggiungi un pulsante" />
                    </button>
                )}
                </div>
                <span className="my-0.5 h-px w-7 bg-white/20" />
                <button
                    type="button"
                    onClick={() => setModifica(m => !m)}
                    className={`${BTN} text-white/50 hover:bg-white/15 hover:text-white`}
                    aria-label="Personalizza la barra"
                    aria-expanded={modifica}
                >
                    <Settings2 size={16} />
                    {!modifica && <Etichetta testo="Personalizza" />}
                </button>
                <button type="button" onClick={vaiInFondo} className={`${BTN} ${ESTREMI}`} aria-label="Fondo pagina">
                    <ArrowDownToLine size={20} />
                    <Etichetta testo="Fondo pagina" />
                </button>

                {modifica && (
                    <Editor
                        scelti={scelti}
                        tools={tools}
                        lang={lang}
                        onClose={() => setModifica(false)}
                        onSave={q => {
                            onSave(q);
                            setModifica(false);
                        }}
                    />
                )}
            </nav>

            {/* Telefono: solo il tasto per tornare su, quando serve */}
            {scrollato && (
                <button
                    type="button"
                    onClick={tornaSu}
                    aria-label="Inizio pagina"
                    className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-dark text-white shadow-xl md:hidden"
                >
                    <ArrowUp size={22} />
                </button>
            )}
        </>
    );
}

function Editor({
    scelti,
    tools,
    lang,
    onClose,
    onSave,
}: {
    scelti: string[];
    tools: Tool[];
    lang: "it" | "en";
    onClose: () => void;
    onSave: (q: string[]) => void;
}) {
    const [bozza, setBozza] = useState(scelti);
    const ref = useRef<HTMLDivElement>(null);

    // Chiude con Esc o cliccando fuori
    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        const fuori = (e: MouseEvent) => {
            const nav = ref.current?.parentElement;
            if (nav && !nav.contains(e.target as Node)) onClose();
        };
        window.addEventListener("keydown", esc);
        window.addEventListener("mousedown", fuori);
        return () => {
            window.removeEventListener("keydown", esc);
            window.removeEventListener("mousedown", fuori);
        };
    }, [onClose]);

    const tutte = [...SEZIONI.map(s => s.key), ...tools.map(t => "tool:" + t.key)];
    const aggiungi = () => {
        const libera = tutte.find(k => !bozza.includes(k)) ?? tutte[0];
        setBozza(b => [...b, libera]);
    };
    const sposta = (i: number, d: number) =>
        setBozza(b => {
            const n = [...b];
            [n[i], n[i + d]] = [n[i + d], n[i]];
            return n;
        });
    const salva = () => onSave(bozza.filter((k, i) => k && bozza.indexOf(k) === i));

    const ICONA = "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink/40 transition hover:bg-grey-bg hover:text-ink disabled:opacity-25 disabled:hover:bg-transparent";

    return (
        <div ref={ref} className="absolute left-full top-1/2 ml-3 w-96 -translate-y-1/2 rounded-2xl border border-grey-line bg-white p-4 text-ink shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
                <div className="font-heading text-sm font-bold">Pulsanti della barra</div>
                <button type="button" onClick={onClose} className="rounded-full p-1 text-ink/40 hover:bg-grey-bg hover:text-ink" aria-label="Chiudi">
                    <X size={16} />
                </button>
            </div>
            <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] text-ink/45">
                <ArrowUpToLine size={12} /> Inizio e <ArrowDownToLine size={12} /> Fondo pagina restano sempre.
            </p>
            <div className="flex flex-col gap-1.5" data-testid="righe-barra">
                {bozza.length === 0 && <p className="py-2 text-xs text-ink/40">Nessun pulsante: aggiungine uno.</p>}
                {bozza.map((v, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className="w-4 shrink-0 text-right text-xs font-semibold text-ink/40">{i + 1}</span>
                        <select
                            value={v}
                            onChange={e => setBozza(b => b.map((x, j) => (j === i ? e.target.value : x)))}
                            aria-label={`Pulsante ${i + 1}`}
                            className="ml-1 min-w-0 flex-1 rounded-lg border-2 border-grey-line bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                        >
                            <optgroup label="Sezioni dell'Hub">
                                {SEZIONI.map(s => (
                                    <option key={s.key} value={s.key}>
                                        {s.label}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Strumenti (si aprono in una nuova scheda)">
                                {tools.map(t => (
                                    <option key={t.key} value={"tool:" + t.key}>
                                        {t.title[lang]}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                        <button type="button" onClick={() => sposta(i, -1)} disabled={i === 0} className={ICONA} aria-label="Sposta su">
                            <ChevronUp size={16} />
                        </button>
                        <button type="button" onClick={() => sposta(i, 1)} disabled={i === bozza.length - 1} className={ICONA} aria-label="Sposta giù">
                            <ChevronDown size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setBozza(b => b.filter((_, j) => j !== i))}
                            className={`${ICONA} hover:!bg-[#fff5f5] hover:!text-brand-red`}
                            aria-label="Elimina pulsante"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={aggiungi}
                disabled={bozza.length >= MAX_PULSANTI}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-grey-line py-1.5 text-xs font-bold text-blue-mid transition hover:border-blue-mid disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus size={14} /> {bozza.length >= MAX_PULSANTI ? `Massimo ${MAX_PULSANTI} pulsanti` : "Aggiungi pulsante"}
            </button>
            <p className="mt-2 text-[0.7rem] text-ink/45">Salvati sul tuo account: li ritrovi su ogni PC.</p>
            <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={salva} className="rounded-lg bg-blue-dark px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-mid">
                    Salva
                </button>
                <button type="button" onClick={() => setBozza(QUICK_PREDEFINITI)} className="text-xs font-semibold text-blue-mid hover:underline">
                    Ripristina predefiniti
                </button>
            </div>
        </div>
    );
}
