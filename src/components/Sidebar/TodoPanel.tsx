import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import type { Priority, Todo } from "../../types/todo";
import { useDwellSeen } from "../../hooks/useDwellSeen";
import { PriorityBars } from "./PriorityBars";
import { RigaSemplice, TodoRow } from "./TodoRow";
import { adattaAltezza } from "./adattaAltezza";

type Filter = "active" | "done" | "all";

/** Testi e aspetto per riusare il pannello con altre liste (Documenti esteri, Picking da preparare). */
export interface VarianteLista {
  titolo: string;
  sottotitolo?: string;
  segnaposto: string;
  vuoto: string;
  vuotoDaFare: string;
  vuotoFatte: string;
  /** prefisso dei segnaposti data-guida (percorsi animati) */
  guida: string;
  /** argomento della guida aperto dal "?" */
  argomento: string;
  /** colonna di destra: si allunga e scorre solo dal formato xl */
  colonna?: boolean;
  /** id del pannello, per raggiungerlo dalla barra laterale */
  ancora?: string;
  /** senza priorità, una sola riga per voce */
  semplice?: boolean;
}

export function TodoPanel({
  todos,
  unseenIds,
  onAdd,
  onToggle,
  onSetPriority,
  onEditText,
  onDelete,
  onSeen,
  variante,
  errore,
}: {
  todos: Todo[];
  unseenIds: Set<string>;
  onAdd: (text: string, priority: Priority) => void;
  onToggle: (item: Todo) => void;
  onSetPriority: (item: Todo, p: Priority) => void;
  onEditText: (item: Todo, text: string) => void;
  onDelete: (item: Todo) => void;
  onSeen: () => void;
  variante?: VarianteLista;
  /** problema di salvataggio da mostrare nel pannello */
  errore?: string;
}) {
  const { t } = useI18n();
  const v: VarianteLista = variante ?? {
    titolo: t.todoTitle,
    segnaposto: t.todoPlaceholder,
    vuoto: t.emptyTodos,
    vuotoDaFare: t.emptyActiveTodos,
    vuotoFatte: t.emptyDoneTodos,
    guida: "todo",
    argomento: "todo",
  };
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>(2);
  const [filter, setFilter] = useState<Filter>("active");

  const handleSeen = useCallback(() => onSeen(), [onSeen]);
  const dwellRef = useDwellSeen<HTMLDivElement>(handleSeen);

  const casella = useRef<HTMLTextAreaElement | null>(null);
  // dopo l'aggiunta la casella torna alta una riga
  useEffect(() => adattaAltezza(casella.current), [text]);

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text, priority);
    setText("");
  };

  // nelle liste semplici resta l'ordine di inserimento
  const active = todos.filter(td => !td.done).sort((a, b) => (v.semplice ? 0 : b.priority - a.priority));
  const done = todos.filter(td => td.done);

  const visibleActive = filter === "done" ? [] : active;
  const visibleDone = filter === "active" ? [] : done;

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "active", label: t.filterActive, count: active.length },
    { id: "done", label: t.filterDone, count: done.length },
    { id: "all", label: t.filterAll, count: todos.length },
  ];

  const renderRow = (item: Todo) =>
    v.semplice ? (
      <RigaSemplice
        key={item.id}
        item={item}
        isNew={unseenIds.has(item.id)}
        onToggle={() => onToggle(item)}
        onEditText={text2 => onEditText(item, text2)}
        onDelete={() => onDelete(item)}
      />
    ) : (
    <TodoRow
      key={item.id}
      item={item}
      isNew={unseenIds.has(item.id)}
      onToggle={() => onToggle(item)}
      onSetPriority={p => onSetPriority(item, p)}
      onEditText={text2 => onEditText(item, text2)}
      onDelete={() => onDelete(item)}
    />
    );

  return (
    <div
      ref={dwellRef}
      id={v.ancora}
      data-guida={v.guida}
      className={`flex scroll-mt-4 flex-col rounded-2xl border border-grey-line bg-white p-4 ${v.colonna ? "lg:h-52 lg:shrink-0" : "lg:min-h-72 lg:flex-1"}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <h3 className="shrink-0 font-heading text-sm font-bold uppercase tracking-wide text-ink">{v.titolo}</h3>
        {v.sottotitolo && <span className="truncate text-[0.7rem] text-ink/40">{v.sottotitolo}</span>}
        {unseenIds.size > 0 && (
          <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
            {unseenIds.size > 9 ? "9+" : unseenIds.size}
          </span>
        )}
        <span className="ml-auto shrink-0 text-[0.7rem] text-ink/40">{t.progress(done.length, todos.length)}</span>
      </div>

      {errore && <p className="mb-2 rounded-lg bg-brand-red/10 px-2.5 py-1.5 text-xs text-brand-red">{errore}</p>}

      <div data-guida={`${v.guida}-nuova`} className="flex items-start gap-1.5">
        {/* Si allunga mentre scrivi. Invio aggiunge, Maiusc+Invio va a capo */}
        <textarea
          rows={1}
          value={text}
          ref={casella}
          onChange={e => setText(v.semplice ? e.target.value.replace(/\s*\n\s*/g, " ") : e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && (v.semplice || !e.shiftKey)) {
              e.preventDefault();
              handleAdd();
            }
          }}
          maxLength={600}
          placeholder={v.segnaposto}
          className="block min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-grey-line px-2.5 py-1.5 text-sm leading-snug outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleAdd}
          title={t.todoAddTitle}
          className="flex h-[34px] shrink-0 items-center justify-center rounded-lg bg-blue-dark px-2.5 text-white hover:bg-blue-mid"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {!v.semplice && (
        <div data-guida={`${v.guida}-priorita`} className="mt-2 flex items-center gap-2">
          <span className="text-[0.65rem] font-semibold text-ink/50">{t.priorityLabel}</span>
          <PriorityBars value={priority} onSelect={setPriority} />
        </div>
      )}

      <div data-guida={`${v.guida}-filtri`} className="mt-3 flex flex-wrap gap-1.5">
        {filters.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold transition ${
              filter === f.id
                ? "border-blue-dark bg-blue-dark text-white"
                : "border-grey-line bg-white text-ink/60 hover:border-blue-mid"
            }`}
          >
            {f.label} <span className="opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      <ul
        className={`mt-2 flex max-h-80 flex-col ${v.semplice ? "gap-0.5" : "gap-1"} overflow-y-auto pr-1 ${
          v.colonna ? "lg:max-h-none lg:min-h-0 lg:flex-1" : "lg:max-h-none lg:min-h-0 lg:flex-1"
        }`}
      >
        {todos.length === 0 && <p className="py-4 text-center text-xs text-ink/40">{v.vuoto}</p>}
        {todos.length > 0 && visibleActive.length === 0 && visibleDone.length === 0 && (
          <p className="py-4 text-center text-xs text-ink/40">
            {filter === "done" ? v.vuotoFatte : v.vuotoDaFare}
          </p>
        )}
        {visibleActive.map(renderRow)}
        {visibleActive.length > 0 && visibleDone.length > 0 && <hr className="my-1 border-grey-line" />}
        {visibleDone.map(renderRow)}
      </ul>
    </div>
  );
}
