import { useCallback, useState } from "react";
import { Check, CircleCheckBig, ClipboardCopy, X, FileCheck2, Package, PackageCheck, Plus, Truck } from "lucide-react";
import { useDwellSeen } from "../../hooks/useDwellSeen";
import { PickingScheda } from "./PickingScheda";
import { PICKING_VUOTO, colliDi, completato, notaExcel, type Firma, type Picking, type PickingDati } from "../../types/picking";

// Pannello Picking: un documento da preparare (ed eventualmente spedire), compilato a mano.
// Tre passi: Collo pronto → Documento allegato → Completata. Con "Completata" passa tra i completati.

type Filtro = "dafare" | "fatti" | "tutti";
/** i tre passi del magazziniere */
type Passaggio = "paccoPronto" | "dnAllegata" | "completata";

const RIGA_VUOTA = { material: "", qty: "1", un: "EA", descrizione: "", vui: "" };

export function PickingPanel({
    voci,
    nuove,
    sigla,
    onSalva,
    onAggiorna,
    onElimina,
    onVisto,
}: {
    voci: Picking[];
    nuove: Set<string>;
    /** nome di chi usa il sito (firma dei passi) */
    sigla: string;
    onSalva: (id: string | null, dati: PickingDati) => Promise<void> | void;
    onAggiorna: (id: string, campi: Partial<PickingDati>) => Promise<void> | void;
    onElimina: (id: string) => Promise<void> | void;
    onVisto: () => void;
}) {
    const [filtro, setFiltro] = useState<Filtro>("dafare");
    const [perUscita, setPerUscita] = useState<"" | "spedire" | "preparare">("");
    const [problema, setProblema] = useState("");
    const [copiato, setCopiato] = useState(false);
    const [scheda, setScheda] = useState<{ id: string | null; dati: PickingDati } | null>(null);
    const vistoRef = useDwellSeen<HTMLDivElement>(useCallback(() => onVisto(), [onVisto]));

    const firma = (p: Picking, k: Passaggio) =>
        onAggiorna(p.id, { [k]: p[k] ? null : ({ sigla, data: new Date().toISOString() } as Firma) });

    const dafare = voci.filter(p => !completato(p));
    const fatti = voci.filter(completato);
    const perStato = filtro === "dafare" ? dafare : filtro === "fatti" ? fatti : [...dafare, ...fatti];
    const visibili = perUscita ? perStato.filter(p => p.uscita === perUscita && p.dn) : perStato;
    const colliPronti = dafare.filter(p => p.paccoPronto).length;

    // Righe pronte da incollare nel foglio Excel, una per materiale, nell'ordine delle sue colonne
    const copiaExcel = async () => {
        const righe = visibili.flatMap(p =>
            (p.righe.length ? p.righe : [{ material: "", qty: "", un: "", descrizione: "", vui: "" }]).map(r =>
                [
                    p.dn, r.material, r.qty, r.un, r.descrizione, r.vui, p.destinazione,
                    colliDi(p).map(c => c.dimensioni).filter(Boolean).join(" + "),
                    colliDi(p).map(c => c.peso).filter(Boolean).join(" + "),
                    notaExcel(p),
                ].join("\t"),
            ),
        );
        try {
            await navigator.clipboard.writeText(righe.join("\n"));
            setCopiato(true);
            setTimeout(() => setCopiato(false), 2000);
        } catch {
            setProblema("Il browser non permette di copiare: riprova");
        }
    };

    return (
        <div
            ref={vistoRef}
            id="sez-picking"
            data-guida="picking"
            className="flex scroll-mt-4 flex-col gap-3 rounded-2xl border border-grey-line bg-white p-4 sm:p-5 lg:min-h-0 lg:flex-1"
        >
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-ink">Picking</h3>

                <span className="ml-auto flex gap-1.5">
                    <button
                        type="button"
                        onClick={copiaExcel}
                        disabled={!visibili.length}
                        title={copiato ? "Copiato!" : "Copia le righe per Excel"}
                        aria-label="Copia per Excel"
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-grey-line hover:bg-grey-bg disabled:opacity-30 ${copiato ? "text-[#2f9e6e]" : "text-ink/45 hover:text-ink"}`}
                    >
                        <ClipboardCopy size={16} />
                    </button>
                </span>
            </div>
            <div className="-mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#fff4cc] px-2.5 py-0.5 text-xs font-bold text-[#7a5b00]">{dafare.length} da fare</span>
                    {colliPronti > 0 && <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-blue-mid">{colliPronti} {colliPronti === 1 ? "collo pronto" : "colli pronti"}</span>}
                    <span className="rounded-full bg-[#2f9e6e]/15 px-2.5 py-0.5 text-xs font-bold text-[#2f9e6e]">{fatti.length} completati</span>
                    {nuove.size > 0 && <span className="rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white">{nuove.size} nuov{nuove.size === 1 ? "o" : "i"}</span>}
            </div>

            <button
                type="button"
                data-guida="picking-incolla"
                onClick={() => setScheda({ id: null, dati: { ...PICKING_VUOTO, righe: [{ ...RIGA_VUOTA }] } })}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b6c4d8] bg-[#fbfdff] px-3.5 py-2.5 text-sm font-bold text-blue-mid transition hover:border-accent hover:bg-accent/5"
            >
                <Plus size={18} /> Nuovo documento da preparare
            </button>
            {problema && <p className="-mt-1 text-xs text-brand-red">{problema}</p>}

            <div data-guida="picking-filtri" className="flex flex-wrap items-center gap-1.5">
                {(
                    [
                        ["dafare", "Da fare", dafare.length],
                        ["fatti", "Completati", fatti.length],
                        ["tutti", "Tutti", voci.length],
                    ] as const
                ).map(([id, et, n]) => (
                    <Filtro key={id} attivo={filtro === id} onClick={() => setFiltro(id)} testo={et} n={n} />
                ))}
                <span className="w-2" />
                <Filtro
                    attivo={perUscita === "spedire"}
                    onClick={() => setPerUscita(perUscita === "spedire" ? "" : "spedire")}
                    testo={<><Truck size={13} /> Da spedire</>}
                    n={perStato.filter(p => p.uscita === "spedire" && p.dn).length}
                />
                <Filtro
                    attivo={perUscita === "preparare"}
                    onClick={() => setPerUscita(perUscita === "preparare" ? "" : "preparare")}
                    testo={<><Package size={13} /> Solo prep.</>}
                    n={perStato.filter(p => p.uscita === "preparare" && p.dn).length}
                />
            </div>

            <ul className="flex max-h-[42rem] flex-col gap-2.5 overflow-y-auto overscroll-contain pr-1 xl:max-h-none xl:min-h-0 xl:flex-1">
                {visibili.length === 0 && (
                    <p className="py-8 text-center text-sm text-ink/40">
                        {voci.length === 0 ? "Nessun picking. Aggiungi un documento qui sopra." : filtro === "fatti" ? "Nessun picking completato." : "Nessun picking da fare."}
                    </p>
                )}
                {visibili.map(p => (
                    <CartaPicking
                        key={p.id}
                        p={p}
                        nuovo={nuove.has(p.id)}
                        onApri={() => setScheda({ id: p.id, dati: p })}
                        onFirma={k => firma(p, k)}
                        onElimina={() => {
                            if (confirm(`Elimino il picking del documento ${p.dn || "(senza numero)"}?`)) void onElimina(p.id);
                        }}
                    />
                ))}
            </ul>

            {scheda && (
                <PickingScheda
                    key={scheda.id ?? "nuovo"}
                    iniziale={scheda.dati}
                    storico={scheda.id ? voci.find(v => v.id === scheda.id)?.storico : undefined}
                    nuovo={!scheda.id}
                    sigla={sigla}
                    onSalva={dati => onSalva(scheda.id, dati)}
                    onElimina={scheda.id ? () => onElimina(scheda.id!) : undefined}
                    onChiudi={() => setScheda(null)}
                />
            )}
        </div>
    );
}

function Filtro({ attivo, onClick, testo, n }: { attivo: boolean; onClick: () => void; testo: React.ReactNode; n: number }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={attivo}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition ${
                attivo ? "border-blue-dark bg-blue-dark text-white" : "border-grey-line bg-white text-ink/60 hover:border-blue-mid"
            }`}
        >
            {testo} <span className="opacity-60">{n}</span>
        </button>
    );
}

const quando = (iso: string) => {
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString()
        ? d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
};

const ITEM_VISIBILI = 3;

/** Una scheda per documento: stato (barra colorata), uscita, item, collo, le due spunte e la ×. */
function CartaPicking({
    p,
    nuovo,
    onApri,
    onFirma,
    onElimina,
}: {
    p: Picking;
    nuovo: boolean;
    onApri: () => void;
    onFirma: (k: Passaggio) => void;
    onElimina: () => void;
}) {
    const fatto = completato(p);
    const vecchia = !p.dn;
    const barra = vecchia ? "bg-[#c9d1dd]" : fatto ? "bg-[#2f9e6e]" : p.paccoPronto || p.dnAllegata ? "bg-accent" : "bg-[#f4b400]";
    const ultimo = p.storico && p.storico.length ? p.storico[p.storico.length - 1] : null;
    const vui = p.righe.map(r => r.vui).filter(Boolean);
    const colli = colliDi(p).filter(c => c.dimensioni || c.peso);
    const avvisi = vecchia
        ? []
        : [...(p.uscita === "spedire" && !p.localita ? ["Manca dove spedire"] : []), ...(!p.righe.length ? ["Nessun materiale"] : [])];

    return (
        <li
            className={`flex shrink-0 overflow-hidden rounded-xl border transition ${
                nuovo ? "border-[#9ad7f2] bg-[#f3fbff] shadow-[0_0_0_2px_rgb(18_163_227/0.35)]" : fatto ? "border-grey-line bg-[#f7faf8]" : "border-grey-line bg-white hover:border-blue-mid/40"
            }`}
        >
            <span className={`w-1.5 shrink-0 ${barra}`} />
            <div className="min-w-0 flex-1 px-3.5 py-3">
                <div className="flex items-start gap-2">
                    <button type="button" onClick={onApri} title="Apri la scheda" className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        <span className={`font-heading text-sm font-bold tracking-wide ${vecchia ? "text-ink/40" : fatto ? "text-ink/55" : "text-ink"}`}>{vecchia ? "Documento da inserire" : p.dn}</span>
                        {vecchia ? (
                            <Etichetta classe="bg-[#fff4cc] text-[#7a5b00]">voce della vecchia lista</Etichetta>
                        ) : (
                            <>
                                {p.uscita === "spedire" ? (
                                    <Etichetta classe="bg-blue-mid/10 text-blue-mid">
                                        <Truck size={12} /> {p.localita ? `Spedire a ${p.localita}` : "Da spedire"}
                                    </Etichetta>
                                ) : (
                                    <Etichetta classe="bg-grey-bg text-ink/60">
                                        <Package size={12} /> Solo preparazione
                                    </Etichetta>
                                )}
                                {p.destinazione && <Etichetta classe="border border-grey-line bg-white text-ink/70">{p.destinazione}</Etichetta>}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onElimina}
                        aria-label={`Elimina il picking del documento ${p.dn}`}
                        title="Elimina"
                        className="-mr-1 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink/30 hover:bg-brand-red/10 hover:text-brand-red"
                    >
                        <X size={18} />
                    </button>
                </div>

                {vecchia ? (
                    <p className="mt-2 rounded-lg bg-grey-bg px-2.5 py-1.5 text-sm text-ink/70">{p.note || "—"}</p>
                ) : (
                    <>
                        {p.righe.length > 0 && (
                            <button type="button" onClick={onApri} className="mt-2 grid w-full grid-cols-[3.2rem_6.8rem_1fr] items-baseline gap-x-2 gap-y-0.5 text-left text-[0.82rem]">
                                {p.righe.slice(0, ITEM_VISIBILI).map((r, i) => (
                                    <span key={i} className="contents">
                                        <b className="text-right text-ink">
                                            {r.qty} {r.un}
                                        </b>
                                        <span className="truncate font-mono text-[0.78rem] text-ink/60">{r.material || "—"}</span>
                                        <span className="truncate text-ink/85">{r.descrizione}</span>
                                    </span>
                                ))}
                                {p.righe.length > ITEM_VISIBILI && (
                                    <span className="col-start-2 col-end-4 text-xs font-bold text-blue-mid">
                                        + {p.righe.length - ITEM_VISIBILI} {p.righe.length - ITEM_VISIBILI === 1 ? "altro item" : "altri item"} · apri la scheda
                                    </span>
                                )}
                            </button>
                        )}
                        {(vui.length > 0 || colli.length > 0 || p.note || avvisi.length > 0) && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/60">
                                {vui.length > 0 && <span>🏷️ {vui.join(" · ")}</span>}
                                {colli.length > 0 && (
                                    <span>
                                        📦 {colli.length === 1 ? "1 collo" : `${colli.length} colli`}: {colli.map(c => [c.dimensioni, c.peso].filter(Boolean).join(" · ")).join("  +  ")}
                                    </span>
                                )}
                                {p.note && <span className="min-w-0 truncate">📝 {p.note}</span>}
                                {avvisi.map(a => (
                                    <span key={a} className="rounded-full bg-[#fff4cc] px-2 py-0.5 font-bold text-[#7a5b00]">
                                        ⚠ {a}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {vecchia ? (
                        <button type="button" onClick={onApri} className="rounded-full bg-blue-dark px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-mid">
                            Completa i dati
                        </button>
                    ) : (
                        <>
                            <Controllo attivo={p.paccoPronto} onClick={() => onFirma("paccoPronto")} icona={<PackageCheck size={15} />} testo="Collo pronto" />
                            <Controllo attivo={p.dnAllegata} onClick={() => onFirma("dnAllegata")} icona={<FileCheck2 size={15} />} testo="Documento allegato" />
                            <Controllo
                                attivo={p.completata ?? null}
                                onClick={() => onFirma("completata")}
                                icona={<CircleCheckBig size={15} />}
                                testo="Completata"
                                bloccato={!p.completata && !(p.paccoPronto && p.dnAllegata) ? "Prima Collo pronto e Documento allegato" : ""}
                            />
                        </>
                    )}
                    {ultimo && (
                        <span className="ml-auto truncate text-[0.7rem] text-ink/40" title="Ultimo passo: lo storico completo è nella scheda">
                            {ultimo.testo} · {ultimo.sigla} {quando(ultimo.data)}
                        </span>
                    )}
                </div>
            </div>
        </li>
    );
}

function Etichetta({ classe, children }: { classe: string; children: React.ReactNode }) {
    return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${classe}`}>{children}</span>;
}

function Controllo({
    attivo,
    onClick,
    icona,
    testo,
    bloccato = "",
}: {
    attivo: Firma | null;
    onClick: () => void;
    icona: React.ReactNode;
    testo: string;
    /** se non vuoto: spunta non ancora disponibile, con il motivo */
    bloccato?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!!bloccato}
            aria-pressed={!!attivo}
            title={
                bloccato
                    ? bloccato
                    : attivo
                    ? `${testo}: ${attivo.sigla}, ${new Date(attivo.data).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · clicca per togliere`
                    : `Segna: ${testo}`
            }
            className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition ${
                attivo ? "border-[#2f9e6e] bg-[#2f9e6e] text-white" : "border-grey-line bg-white text-ink/60 enabled:hover:border-[#2f9e6e] enabled:hover:text-[#2f9e6e] disabled:opacity-40"
            }`}
        >
            {attivo ? <Check size={15} strokeWidth={3} /> : icona}
            {testo}
            {attivo && (
                <span className="text-xs font-semibold opacity-85">
                    {attivo.sigla} {quando(attivo.data)}
                </span>
            )}
        </button>
    );
}
