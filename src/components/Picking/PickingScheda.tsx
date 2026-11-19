import { useEffect, useState } from "react";
import { CircleCheckBig, PackageCheck, FileCheck2, Plus, Trash2, Truck, Package, X } from "lucide-react";
import { colliDi, type Collo, type Firma, type Passo, type PickingDati, type RigaMateriale } from "../../types/picking";

// Scheda del picking: si apre con "Nuovo documento da preparare" (vuota, da compilare a mano)
// oppure cliccando un picking dell'elenco. Tutto modificabile prima di salvare.

const RIGA_VUOTA: RigaMateriale = { material: "", qty: "1", un: "EA", descrizione: "", vui: "" };

const CAMPO = "w-full rounded-lg border border-grey-line bg-white px-2.5 py-1.5 text-sm outline-none focus:border-accent";
const ETICHETTA = "mb-1 block text-[0.65rem] font-bold uppercase tracking-wide text-ink/50";

export function PickingScheda({
    iniziale,
    storico,
    nuovo,
    avvisi,
    sigla,
    onSalva,
    onElimina,
    onChiudi,
}: {
    iniziale: PickingDati;
    /** passi già fatti su questo picking (chi, cosa, quando) */
    storico?: Passo[];
    nuovo: boolean;
    avvisi?: string[];
    sigla: string;
    onSalva: (d: PickingDati) => Promise<void> | void;
    onElimina?: () => Promise<void> | void;
    onChiudi: () => void;
}) {
    // i colli partono anche dai picking salvati col vecchio formato (un collo solo)
    const [d, setD] = useState<PickingDati>(() => ({ ...iniziale, colli: colliDi(iniziale).length ? colliDi(iniziale) : [{ dimensioni: "", peso: "" }] }));
    const [salvando, setSalvando] = useState(false);
    const [errore, setErrore] = useState("");

    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [onChiudi]);

    const set = <K extends keyof PickingDati>(k: K, v: PickingDati[K]) => setD(x => ({ ...x, [k]: v }));
    const setRiga = (i: number, campi: Partial<RigaMateriale>) => set("righe", d.righe.map((r, k) => (k === i ? { ...r, ...campi } : r)));
    const firma = (k: "paccoPronto" | "dnAllegata" | "completata") => set(k, d[k] ? null : ({ sigla, data: new Date().toISOString() } as Firma));
    const colli = d.colli ?? [];
    const setCollo = (i: number, campi: Partial<Collo>) => set("colli", colli.map((c, k) => (k === i ? { ...c, ...campi } : c)));

    const salva = async () => {
        const dn = d.dn.trim();
        if (!dn) return setErrore("Manca il numero del documento");
        setSalvando(true);
        setErrore("");
        try {
            await onSalva({
                ...d,
                dn,
                colli: colli.map(c => ({ dimensioni: c.dimensioni.trim(), peso: c.peso.trim() })).filter(c => c.dimensioni || c.peso),
                dimensioni: "",
                peso: "",
                righe: d.righe.filter(r => r.material.trim() || r.descrizione.trim()).map(r => ({ ...r, vui: r.vui.trim() })),
            });
            onChiudi();
        } catch (e) {
            setErrore(e instanceof Error ? e.message : "Salvataggio non riuscito");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            <div className="absolute inset-0 bg-black/50" onClick={onChiudi} />
            <div role="dialog" aria-modal="true" aria-label="Picking" className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center gap-3 rounded-t-2xl bg-blue-dark px-5 py-3 text-white">
                    <div className="min-w-0">
                        <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/60">{nuovo ? "Nuovo picking" : "Picking"}</div>
                        <div className="font-heading text-lg font-bold leading-tight">{d.dn ? `Documento ${d.dn}` : "Documento da inserire"}</div>
                    </div>
                    <button type="button" onClick={onChiudi} aria-label="Chiudi" className="ml-auto text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 p-5">
                    {avvisi && avvisi.length > 0 && (
                        <div className="rounded-lg border border-[#f2c94c] bg-[#fffbeb] px-3 py-2 text-xs text-[#7a5b00]">
                            {avvisi.map(a => (
                                <div key={a}>⚠ {a}</div>
                            ))}
                        </div>
                    )}

                    {/* Spedire o solo preparazione */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div data-guida="picking-uscita" className="inline-flex overflow-hidden rounded-lg border border-grey-line">
                            {(
                                [
                                    ["spedire", "Spedire", <Truck key="t" size={15} />],
                                    ["preparare", "Solo preparazione", <Package key="p" size={15} />],
                                ] as const
                            ).map(([v, et, ic]) => (
                                <button
                                    key={v}
                                    type="button"
                                    aria-pressed={d.uscita === v}
                                    onClick={() => set("uscita", v)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition ${
                                        d.uscita === v ? "bg-blue-dark text-white" : "bg-white text-ink/60 hover:bg-grey-bg"
                                    }`}
                                >
                                    {ic}
                                    {et}
                                </button>
                            ))}
                        </div>
                        {d.uscita === "spedire" && (
                            <label className="flex min-w-48 flex-1 items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink/70">
                                Spedire a
                                <input value={d.localita} onChange={e => set("localita", e.target.value)} className={CAMPO} />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label>
                            <span className={ETICHETTA}>Numero documento</span>
                            <input value={d.dn} onChange={e => set("dn", e.target.value)} aria-label="Numero documento" className={`${CAMPO} font-bold`} />
                        </label>
                        <label>
                            <span className={ETICHETTA}>Destinazione</span>
                            <input value={d.destinazione} onChange={e => set("destinazione", e.target.value)} className={CAMPO} />
                        </label>
                    </div>

                    {/* Materiali */}
                    <div>
                        <span className={ETICHETTA}>Materiali</span>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-sm">
                                <thead>
                                    <tr className="text-left text-[0.65rem] uppercase tracking-wide text-ink/45">
                                        <th className="w-28 pb-1 font-bold">Material</th>
                                        <th className="w-16 pb-1 font-bold">Q.ty</th>
                                        <th className="w-14 pb-1 font-bold">Un</th>
                                        <th className="pb-1 font-bold">Description</th>
                                        <th className="w-32 pb-1 font-bold">VUI / Batch</th>
                                        <th className="w-7" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.righe.map((r, i) => (
                                        <tr key={i}>
                                            <td className="py-0.5 pr-1.5">
                                                <input value={r.material} onChange={e => setRiga(i, { material: e.target.value })} className={CAMPO} />
                                            </td>
                                            <td className="py-0.5 pr-1.5">
                                                <input value={r.qty} onChange={e => setRiga(i, { qty: e.target.value })} className={CAMPO} />
                                            </td>
                                            <td className="py-0.5 pr-1.5">
                                                <input value={r.un} onChange={e => setRiga(i, { un: e.target.value.toUpperCase() })} className={CAMPO} />
                                            </td>
                                            <td className="py-0.5 pr-1.5">
                                                <input value={r.descrizione} onChange={e => setRiga(i, { descrizione: e.target.value })} className={CAMPO} />
                                            </td>
                                            <td className="py-0.5 pr-1.5">
                                                <input value={r.vui} onChange={e => setRiga(i, { vui: e.target.value })} placeholder="—" className={CAMPO} />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => set("righe", d.righe.filter((_, k) => k !== i))}
                                                    aria-label="Togli materiale"
                                                    className="rounded p-1 text-ink/30 hover:bg-brand-red/10 hover:text-brand-red"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button type="button" onClick={() => set("righe", [...d.righe, { ...RIGA_VUOTA }])} className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-mid hover:underline">
                            <Plus size={13} /> Aggiungi materiale
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.2fr_1fr]">
                        {/* Colli: uno o più, ognuno con dimensioni e peso */}
                        <div data-guida="picking-colli">
                            <span className={ETICHETTA}>Colli</span>
                            <div className="flex flex-col gap-1.5">
                                {colli.map((c, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <span className="w-14 shrink-0 text-xs font-bold text-ink/50">Collo {i + 1}</span>
                                        <input value={c.dimensioni} onChange={e => setCollo(i, { dimensioni: e.target.value })} placeholder="es. 40X30X20" aria-label={`Dimensioni collo ${i + 1}`} className={CAMPO} />
                                        <input value={c.peso} onChange={e => setCollo(i, { peso: e.target.value })} placeholder="es. 6KG" aria-label={`Peso collo ${i + 1}`} className={`${CAMPO} max-w-24`} />
                                        <button
                                            type="button"
                                            onClick={() => set("colli", colli.filter((_, k) => k !== i))}
                                            aria-label={`Togli collo ${i + 1}`}
                                            className="shrink-0 rounded p-1 text-ink/30 hover:bg-brand-red/10 hover:text-brand-red"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => set("colli", [...colli, { dimensioni: "", peso: "" }])} className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-mid hover:underline">
                                <Plus size={13} /> Aggiungi collo
                            </button>
                        </div>
                        <label>
                            <span className={ETICHETTA}>Note</span>
                            <textarea value={d.note} onChange={e => set("note", e.target.value)} placeholder="Note libere…" rows={3} className={`${CAMPO} resize-none`} />
                        </label>
                    </div>

                    {/* I tre passi del magazziniere: Collo pronto → Documento allegato → Completata */}
                    <div className="flex flex-wrap gap-2">
                        <Spunta attiva={d.paccoPronto} onClick={() => firma("paccoPronto")} icona={<PackageCheck size={16} />} testo="Collo pronto" />
                        <Spunta attiva={d.dnAllegata} onClick={() => firma("dnAllegata")} icona={<FileCheck2 size={16} />} testo="Documento allegato" />
                        <Spunta
                            attiva={d.completata ?? null}
                            onClick={() => firma("completata")}
                            icona={<CircleCheckBig size={16} />}
                            testo="Completata"
                            bloccato={!d.completata && !(d.paccoPronto && d.dnAllegata) ? "Prima Collo pronto e Documento allegato" : ""}
                        />
                    </div>

                    {storico && storico.length > 0 && (
                        <details className="rounded-lg border border-grey-line bg-grey-bg/60 px-3 py-2 text-xs" open={storico.length <= 4}>
                            <summary className="cursor-pointer font-bold uppercase tracking-wide text-ink/50">Storico ({storico.length})</summary>
                            <ol className="mt-1.5 flex max-h-40 flex-col gap-1 overflow-y-auto">
                                {[...storico].reverse().map((p, i) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="shrink-0 tabular-nums text-ink/40">
                                            {new Date(p.data).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <b className="shrink-0 text-blue-dark">{p.sigla || "?"}</b>
                                        <span className="min-w-0 text-ink/75">{p.testo}</span>
                                    </li>
                                ))}
                            </ol>
                        </details>
                    )}

                    {errore && <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm text-brand-red">{errore}</p>}
                </div>

                <div className="flex items-center gap-2 rounded-b-2xl border-t border-grey-line bg-grey-bg px-5 py-3">
                    {onElimina && (
                        <button
                            type="button"
                            onClick={async () => {
                                if (!confirm(`Elimino il picking del documento ${d.dn}?`)) return;
                                await onElimina();
                                onChiudi();
                            }}
                            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-ink/50 hover:bg-brand-red/10 hover:text-brand-red"
                        >
                            <Trash2 size={14} /> Elimina
                        </button>
                    )}
                    <span className="flex-1" />
                    <button type="button" onClick={onChiudi} className="rounded-full px-4 py-1.5 text-sm font-bold text-ink/60 hover:bg-white">
                        Annulla
                    </button>
                    <button
                        type="button"
                        onClick={salva}
                        disabled={salvando}
                        className="rounded-full bg-blue-dark px-5 py-1.5 text-sm font-bold text-white hover:bg-blue-mid disabled:opacity-50"
                    >
                        {salvando ? "Salvo…" : "Salva"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Spunta({
    attiva,
    onClick,
    icona,
    testo,
    bloccato = "",
}: {
    attiva: Firma | null;
    onClick: () => void;
    icona: React.ReactNode;
    testo: string;
    bloccato?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!!bloccato}
            title={bloccato || undefined}
            aria-pressed={!!attiva}
            className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition ${
                attiva ? "border-[#2f9e6e] bg-[#2f9e6e]/10 text-[#2f9e6e]" : "border-grey-line text-ink/60 enabled:hover:border-[#2f9e6e] disabled:opacity-40"
            }`}
        >
            {icona}
            {testo}
            {attiva && (
                <span className="text-[0.7rem] font-semibold opacity-80">
                    · {attiva.sigla} {new Date(attiva.data).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })}
                </span>
            )}
        </button>
    );
}
