import type { Lang } from "../types/lang";

export interface PrintStrings {
    step1: string;
    pastePlaceholder: string;
    hintPrefix: string;
    hintColumns: string;
    hintSuffix: string;
    hintMoreRows: string;
    hintTwoPerSheet: string;
    step2: string;
    emptyState: string;
    invalidRows: string;
    step3: string;
    btnPrint: string;
    btnClear: string;
    previewTitle: string;
    rowsWord: (n: number) => string;
    warnPasteFirst: string;
    toolsLabel: string;
    noToolsLabel: string;
    emptyPending: string;
    manualToggle: string;
    removeRow: string;
    checking: string;
    printedOk: (n: number) => string;
    alreadyPrinted: (dns: string) => string;
    goneBeforePrint: (dns: string) => string;
    popupBlocked: string;
    openPdf: string;
    reprint: string;
    autoRefresh: string;
    newArrived: (n: number) => string;
    restore: (n: number) => string;
}

export const I18N_PRINT: Record<Lang, PrintStrings> = {
    it: {
        step1: "1 — Incolla le righe da stampare",
        pastePlaceholder:
            "Incolla qui una o più righe copiate dall'Excel...\n\nEsempio:\n00000001\t24/06/2026\t100000123\t1234\tx\tTurbina 01\tSostituzione componente\n\nVengono usati solo: MRP, Data, Documento, VAN, Turbina, Attività. Il resto è ignorato.",
        hintPrefix: "📋 Colonne usate:",
        hintColumns: "Data · VAN · Turbine · Activity",
        hintSuffix: "— tutto il resto viene ignorato automaticamente.",
        hintMoreRows: "Più righe incollate = più schede.",
        hintTwoPerSheet: "2 schede per foglio A4",
        step2: "2 — Schede in stampa",
        emptyState: "Nessuna scheda in stampa.",
        invalidRows: "Nessuna riga valida riconosciuta.",
        step3: "3 — Stampa",
        btnPrint: "🖨 Stampa / Salva PDF",
        btnClear: "✕ Cancella",
        previewTitle: "Anteprima fogli A4",
        rowsWord: n => (n === 1 ? "riga" : "righe"),
        warnPasteFirst: "⚠️  Incolla prima i dati.",
        toolsLabel: "TOOLS",
        noToolsLabel: "No tools",
        emptyPending: "Nessun documento da stampare. 👍",
        manualToggle: "Aggiungi righe a mano (incolla dall'Excel)",
        removeRow: "Togli dalla stampa",
        checking: "Controllo l'archivio…",
        printedOk: n => (n === 1 ? "✓ 1 documento stampato" : `✓ ${n} documenti stampati`),
        alreadyPrinted: dns => `Già segnate da un altro operatore: ${dns}`,
        goneBeforePrint: dns => `Tolte perché stampate nel frattempo da un altro operatore: ${dns}`,
        popupBlocked: "Il browser ha bloccato la finestra del PDF.",
        openPdf: "Apri il PDF",
        reprint: "↻ Riapri ultimo PDF",
        autoRefresh: "si aggiorna da solo ogni minuto",
        newArrived: n => (n === 1 ? "1 nuovo documento" : `${n} nuovi documenti`),
        restore: n => (n === 1 ? "Rimetti 1 documento tolto" : `Rimetti ${n} documenti tolti`),
    },
    en: {
        step1: "1 — Paste the rows to print",
        pastePlaceholder:
            "Paste one or more rows copied from Excel here...\n\nExample:\n00000001\t24/06/2026\t100000123\t1234\tx\tTurbina 01\tSostituzione componente\n\nOnly used: MRP, Date, Document, VAN, Turbine, Activity. Everything else is ignored.",
        hintPrefix: "📋 Columns used:",
        hintColumns: "Date · VAN · Turbine · Activity",
        hintSuffix: "— everything else is ignored automatically.",
        hintMoreRows: "More pasted rows = more cards.",
        hintTwoPerSheet: "2 cards per A4 sheet",
        step2: "2 — Cards to print",
        emptyState: "No cards to print.",
        invalidRows: "No valid rows recognized.",
        step3: "3 — Print",
        btnPrint: "🖨 Print / Save PDF",
        btnClear: "✕ Clear",
        previewTitle: "A4 Sheets Preview",
        rowsWord: n => (n === 1 ? "row" : "rows"),
        warnPasteFirst: "⚠️  Paste the data first.",
        toolsLabel: "TOOLS",
        noToolsLabel: "No tools",
        emptyPending: "No documents to print. 👍",
        manualToggle: "Add rows by hand (paste from Excel)",
        removeRow: "Remove from print",
        checking: "Checking the archive…",
        printedOk: n => (n === 1 ? "✓ 1 document printed" : `✓ ${n} documents printed`),
        alreadyPrinted: dns => `Already marked by another operator: ${dns}`,
        goneBeforePrint: dns => `Removed because another operator printed them meanwhile: ${dns}`,
        popupBlocked: "The browser blocked the PDF window.",
        openPdf: "Open the PDF",
        reprint: "↻ Reopen last PDF",
        autoRefresh: "refreshes by itself every minute",
        newArrived: n => (n === 1 ? "1 new document" : `${n} new documents`),
        restore: n => (n === 1 ? "Put back 1 removed document" : `Put back ${n} removed documents`),
    },
};
