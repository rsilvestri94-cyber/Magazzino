import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { I18N_PRINT } from "../../i18n/printStrings";
import { type ColumnMap, type WorkOrderRow, isTools, parseAll } from "../../lib/workOrders";
import { buildWorkOrderPdf } from "../../lib/workOrderPdf";
import { coloreMagazzino, etichettaMagazzino } from "../../lib/magazzini";
import { ChipMagazzini } from "./ChipMagazzini";

// STAMPA ATTIVITÀ: si incollano le righe copiate dall'Excel, ogni riga diventa una scheda
// (2 per foglio A4). Nessun archivio collegato: si lavora solo con l'incolla.

interface Scheda {
    key: string;
    row: WorkOrderRow;
}

/** Stesso magazzino vicino: si stampa un magazzino dopo l'altro, nell'ordine in cui compaiono. */
function raggruppaPerMagazzino<T extends { row: WorkOrderRow }>(lista: T[]): T[] {
    const ordine: string[] = [];
    lista.forEach(s => {
        const m = s.row.mrp || "";
        if (!ordine.includes(m)) ordine.push(m);
    });
    return [...lista].sort((a, b) => ordine.indexOf(a.row.mrp || "") - ordine.indexOf(b.row.mrp || ""));
}

export function PrintToolPanel({ columns, onPending }: { columns: ColumnMap; onPending?: (n: number | null) => void }) {
    const { lang } = useI18n();
    const t = I18N_PRINT[lang];

    const [raw, setRaw] = useState("");
    const [tolte, setTolte] = useState<Set<string>>(new Set());
    // TOOLS: valore scelto a mano; se assente vale quello automatico (isTools)
    const [toolsScelti, setToolsScelti] = useState<Record<string, boolean>>({});

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [ultimoPdf, setUltimoPdf] = useState<string | null>(null);
    const [esito, setEsito] = useState<{ bloccato?: boolean } | null>(null);

    const schede: Scheda[] = useMemo(
        () =>
            raggruppaPerMagazzino(
                parseAll(raw, columns)
                    .map((row, i) => ({ key: "m" + i, row }))
                    .filter(s => !tolte.has(s.key)),
            ),
        [raw, columns, tolte],
    );

    useEffect(() => {
        onPending?.(schede.length || null);
    }, [schede.length, onPending]);

    const isToolsScheda = useCallback((s: Scheda) => (s.key in toolsScelti ? toolsScelti[s.key] : isTools(s.row.activity)), [toolsScelti]);

    const creaPdf = useCallback(() => {
        const flags: Record<number, boolean> = {};
        schede.forEach((s, i) => (flags[i] = isToolsScheda(s)));
        return buildWorkOrderPdf(schede.map(s => s.row), flags).output("bloburl").toString();
    }, [schede, isToolsScheda]);

    // L'anteprima è il PDF vero, lo stesso che si apre con "Stampa"
    useEffect(() => {
        if (schede.length === 0) {
            setPdfUrl(null);
            return;
        }
        const url = creaPdf();
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [schede, creaPdf]);

    const togli = (s: Scheda) => setTolte(prev => new Set(prev).add(s.key));

    const handlePrint = () => {
        if (schede.length === 0) return;
        const url = creaPdf();
        if (ultimoPdf) URL.revokeObjectURL(ultimoPdf);
        setUltimoPdf(url);
        const win = window.open(url, "_blank");
        setEsito({ bloccato: !win });
    };

    const handleClear = () => {
        setRaw("");
        setTolte(new Set());
        setToolsScelti({});
        setEsito(null);
    };

    const toggleTools = (s: Scheda) => setToolsScelti(f => ({ ...f, [s.key]: !isToolsScheda(s) }));

    return (
        <div className="rounded-2xl border border-grey-line bg-white p-5">
            <div className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-blue-mid">{t.step1}</div>
            <div className="mb-6">
                <textarea
                    value={raw}
                    onChange={e => {
                        setRaw(e.target.value);
                        setTolte(new Set());
                        setToolsScelti({});
                    }}
                    placeholder={t.pastePlaceholder}
                    aria-label={t.step1}
                    rows={6}
                    className="w-full rounded-xl border-2 border-grey-line bg-white p-4 font-mono text-sm text-ink outline-none focus:border-accent"
                />
                <p className="mt-1 text-xs leading-relaxed text-ink/50">
                    {t.hintMoreRows} <strong className="text-blue-mid">{t.hintTwoPerSheet}</strong>.
                    {raw.trim() && parseAll(raw, columns).length === 0 && <span className="ml-2 text-brand-red">{t.invalidRows}</span>}
                </p>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2 font-heading text-xs font-bold uppercase tracking-wide text-blue-mid">
                <span>{t.step2}</span>
                {schede.length > 0 && (
                    <span className="rounded-full bg-blue-dark px-2.5 py-0.5 text-[0.65rem] text-white">
                        {schede.length} {t.rowsWord(schede.length)}
                    </span>
                )}
                {schede.length > 0 && (
                    <span className="normal-case tracking-normal">
                        <ChipMagazzini righe={schede.map(s => s.row)} />
                    </span>
                )}
            </div>

            <div data-guida="stampa-schede" className="mb-8 flex max-h-112 flex-col gap-2.5 overflow-y-auto pr-0.5">
                {schede.length === 0 && <div className="py-2 text-sm text-ink/40">{t.emptyState}</div>}
                {schede.map((s, i) => {
                    const active = isToolsScheda(s);
                    const colore = coloreMagazzino(s.row.mrp);
                    return (
                        <div key={s.key} className="flex items-center gap-3 rounded-lg border-l-8 bg-white p-3 shadow-sm" style={{ borderLeftColor: colore }}>
                            <div className="flex w-24 shrink-0 flex-col items-start gap-1">
                                <span className="font-heading text-xs font-bold text-ink/30">#{i + 1}</span>
                                <span className="rounded px-1.5 py-0.5 text-[0.65rem] font-bold leading-tight text-white" style={{ background: colore }}>
                                    {etichettaMagazzino(s.row.mrp)}
                                </span>
                            </div>
                            <div className="grid flex-1 grid-cols-[1fr_70px_1.6fr_90px] items-center gap-2.5">
                                <div>
                                    <div className="font-heading text-[0.6rem] font-bold uppercase tracking-wide text-accent">Turbine</div>
                                    <div className="font-heading text-sm font-semibold text-blue-dark">{s.row.turbine}</div>
                                </div>
                                <div>
                                    <div className="font-heading text-[0.6rem] font-bold uppercase tracking-wide text-accent">VAN</div>
                                    <div className="font-heading text-sm font-semibold text-blue-dark">{s.row.van}</div>
                                </div>
                                <div>
                                    <div className="font-heading text-[0.6rem] font-bold uppercase tracking-wide text-accent">Activity</div>
                                    <div className="font-heading text-sm font-semibold text-blue-dark">{s.row.activity}</div>
                                </div>
                                <div>
                                    <div className="font-heading text-[0.6rem] font-bold uppercase tracking-wide text-accent">Date</div>
                                    <div className="font-heading text-sm font-semibold text-[#5a7090]">{s.row.date}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggleTools(s)}
                                data-guida="stampa-tools"
                                aria-pressed={active}
                                className={`flex w-26 shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 px-1.5 py-1 transition ${
                                    active ? "border-brand-red bg-[#fff5f5]" : "border-transparent bg-grey-bg"
                                }`}
                            >
                                <span className={`relative h-4.5 w-8 shrink-0 rounded-full transition-colors ${active ? "bg-brand-red" : "bg-[#d0d8e4]"}`}>
                                    <span
                                        className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-3.5" : "translate-x-0"}`}
                                    />
                                </span>
                                <span className={`whitespace-nowrap font-heading text-[0.6rem] font-bold uppercase tracking-wide ${active ? "text-brand-red" : "text-ink/30"}`}>
                                    {active ? t.toolsLabel : t.noToolsLabel}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => togli(s)}
                                data-guida="stampa-togli"
                                title={t.removeRow}
                                aria-label={t.removeRow}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-ink/30 transition hover:bg-grey-bg hover:text-brand-red"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mb-1 font-heading text-xs font-bold uppercase tracking-wide text-blue-mid">{t.step3}</div>
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handlePrint}
                    data-guida="stampa-vai"
                    disabled={!pdfUrl}
                    className="rounded-lg bg-blue-dark px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-dark/20 hover:bg-blue-mid disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                    {t.btnPrint}
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-lg border-2 border-grey-line bg-transparent px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-blue-mid hover:border-blue-mid"
                >
                    {t.btnClear}
                </button>
                {ultimoPdf && (
                    <a href={ultimoPdf} target="_blank" rel="noopener" className="text-sm font-semibold text-blue-mid hover:underline">
                        {t.reprint}
                    </a>
                )}
            </div>
            {esito?.bloccato && (
                <div className="mt-3 flex flex-col gap-1 text-sm" role="status">
                    {esito.bloccato && ultimoPdf && (
                        <span className="text-brand-red">
                            {t.popupBlocked}{" "}
                            <a href={ultimoPdf} target="_blank" rel="noopener" className="font-semibold underline">
                                {t.openPdf}
                            </a>
                        </span>
                    )}
                </div>
            )}

            <div className="mt-11 overflow-hidden rounded-2xl bg-[#b8c8d8] p-6">
                <h2 className="mb-4 font-heading text-xs font-bold uppercase tracking-wide text-blue-dark opacity-65">{t.previewTitle}</h2>
                {pdfUrl ? (
                    <iframe src={pdfUrl} title={t.previewTitle} className="aspect-210/297 mx-auto w-full rounded-lg border border-grey-line bg-white shadow-lg" />
                ) : (
                    <div className="flex aspect-210/297 mx-auto w-full items-center justify-center rounded-lg border border-dashed border-grey-line bg-white/60 text-sm text-ink/40">
                        {t.emptyState}
                    </div>
                )}
            </div>
        </div>
    );
}
