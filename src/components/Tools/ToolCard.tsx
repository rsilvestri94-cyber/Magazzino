import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useI18n } from "../../i18n/I18nContext";
import type { Tool } from "../../types/tool";
import { ToolIcon } from "./ToolIcon";
import { ToolForm, type ToolFormValues } from "./ToolForm";

export function ToolCard({
  tool,
  editing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  tool: Tool;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (values: ToolFormValues) => void;
  onDelete?: () => void;
}) {
  const { lang, t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tool.key });

  // maniglie bianche sulla fascia colorata, grigie sul bianco
  const elimina = onDelete
    ? () => {
        if (window.confirm(`Elimino «${tool.title[lang]}» dai tuoi Tools?\n\nSparisce solo dalla tua griglia; puoi farlo ricomparire in fondo ai Tools.`)) onDelete();
      }
    : undefined;

  const maniglia = tool.color ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-ink/30 hover:bg-grey-bg hover:text-ink";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    "--tool-color": tool.color || undefined,
  } as React.CSSProperties;

  if (editing) {
    return (
      <div ref={setNodeRef} style={style}>
        <ToolForm
          initial={{ title: tool.title[lang], description: tool.description[lang], url: tool.url, icon: tool.icon, color: tool.color ?? "" }}
          submitLabel={t.formSave}
          onCancel={onCancelEdit}
          onSubmit={onSave}
          onDelete={elimina}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-colore={tool.color || undefined}
      className={`group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-grey-line bg-white p-3.5 shadow-sm transition ${
        isDragging ? "opacity-50" : "hover:shadow-md"
      }`}
    >
      {/* Con un colore assegnato: onda colorata in alto (come la collina della testata), su due livelli */}
      {tool.color && (
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-[58px] w-full" aria-hidden="true">
          <path d="M0 0 H300 V78 C 230 100, 140 58, 0 88 Z" fill={tool.color} opacity={0.35} />
          <path d="M0 0 H300 V58 C 220 82, 120 40, 0 70 Z" fill={tool.color} opacity={0.85} />
        </svg>
      )}
      <div className="relative flex items-start justify-between gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={
            tool.color
              ? { background: "#fff", color: tool.color, boxShadow: "0 2px 6px rgb(0 0 0 / 0.15)" }
              : { background: "#f0f4f8", color: "#0052a5" }
          }
        >
          <ToolIcon icon={tool.icon} className="h-5 w-5" />
        </div>
        <div data-guida="tool-maniglie" className="flex items-center gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            title={t.dragTitle}
            className={`cursor-grab touch-none rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing ${maniglia}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <circle cx="9" cy="6" r="1.4" />
              <circle cx="15" cy="6" r="1.4" />
              <circle cx="9" cy="12" r="1.4" />
              <circle cx="15" cy="12" r="1.4" />
              <circle cx="9" cy="18" r="1.4" />
              <circle cx="15" cy="18" r="1.4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onStartEdit}
            title={t.gearTitle}
            className={`rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 ${maniglia}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {elimina && (
            <button
              type="button"
              onClick={elimina}
              title="Elimina dai tuoi Tools"
              aria-label={`Elimina ${tool.title[lang]}`}
              className={`rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 ${tool.color ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-ink/30 hover:bg-brand-red/10 hover:text-brand-red"}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            </button>
          )}
        </div>
      </div>

      <Collegamento url={tool.url} className="relative flex flex-1 flex-col gap-1">
        {/* Al massimo 2 righe di titolo e 1 di descrizione: tutti i riquadri restano alti uguali.
            Il testo completo compare passando col mouse. */}
        <h3 title={tool.title[lang]} className="line-clamp-2 font-heading text-sm font-bold text-ink">
          {tool.title[lang]}
        </h3>
        <p title={tool.description[lang] || undefined} className="line-clamp-1 text-xs text-ink/60">
          {tool.description[lang] || t.noDescription}
        </p>
      </Collegamento>

      {tool.url ? (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative self-start rounded-full px-3 py-1.5 text-xs font-bold transition"
          style={
            tool.color
              ? // pulsante più deciso: fondo più carico e testo scurito, leggibile anche con giallo e lime
                { background: `${tool.color}2e`, color: `color-mix(in srgb, ${tool.color} 70%, black)` }
              : { background: "#e6f7fd", color: "#0052a5" }
          }
        >
          {tool.cta[lang]} ↗
        </a>
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          title="Nessun link inserito: clicca per aggiungerlo"
          className="relative self-start rounded-full border border-dashed border-grey-line px-3 py-1.5 text-xs font-semibold text-ink/45 transition hover:border-blue-mid hover:text-blue-mid"
        >
          Link da inserire
        </button>
      )}
    </div>
  );
}

// Senza link il riquadro non porta da nessuna parte: niente <a>, solo il testo.
function Collegamento({ url, className, children }: { url: string; className: string; children: React.ReactNode }) {
  if (!url) return <div className={className}>{children}</div>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
