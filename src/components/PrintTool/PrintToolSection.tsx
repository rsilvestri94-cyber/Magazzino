import { useCallback, useState } from "react";
import { useApriSuRichiesta } from "../../lib/navigazione";
import { useI18n } from "../../i18n/I18nContext";
import { WORK_ORDER_COLUMNS } from "../../lib/workOrders";
import { PrintToolPanel } from "./PrintToolPanel";

export function PrintToolSection() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [daStampare, setDaStampare] = useState<number | null>(null);
  useApriSuRichiesta("sez-stampa", useCallback(() => setOpen(true), []));
  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-grey-line bg-white">
        <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-heading text-sm font-bold text-ink">
              {t.printLabel}
              {daStampare !== null && daStampare > 0 && (
                <span className="rounded-full bg-brand-red px-2 py-0.5 text-[0.7rem] font-bold text-white" data-testid="badge-stampa">
                  {daStampare}
                </span>
              )}
            </div>
            <div className="text-xs text-ink/50">{t.printSub}</div>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {/* Resta montato anche da chiuso: così l'elenco è già pronto e il numero sul titolo si aggiorna */}
        <div className={open ? "border-t border-grey-line bg-grey-bg p-4" : "hidden"}>
          <PrintToolPanel columns={WORK_ORDER_COLUMNS} onPending={setDaStampare} />
        </div>
      </div>
    </section>
  );
}
