import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useLocale } from "../lib/locale";
import { useListaLocale, useCommentiLocali } from "../lib/listeLocali";
import { usePrefsLocali } from "../lib/prefsLocali";
import { usePickingLocale } from "../lib/pickingLocale";
import { HeroGemello, NomeModal } from "../components/Gemello/HeroGemello";
import { MaterialeAccettazione } from "../components/Gemello/MaterialeAccettazione";
import { Footer } from "../components/Footer";
import { ToolsGrid } from "../components/Tools/ToolsGrid";
import { TodoPanel } from "../components/Sidebar/TodoPanel";
import { CommentsPanel } from "../components/Sidebar/CommentsPanel";
import { PACKING } from "../components/Sidebar/ListeOperative";
import { PickingPanel } from "../components/Picking/PickingPanel";
import { PrintToolSection } from "../components/PrintTool/PrintToolSection";
import { defaultCta } from "../data/tools";
import { QuickRail } from "../components/QuickRail/QuickRail";
import { MiniParco, OrizzonteEolico } from "../components/Decor/Turbine";
import type { ToolFormValues } from "../components/Tools/ToolForm";

// Hub gemello: stessa disposizione dell'Hub, ma senza account né server.
// Tutto (To-Do, liste, Picking, disposizione dei Tools) resta salvato in questo browser.

const NESSUNA = new Set<string>();
const niente = () => {};

export function GemelloPage() {
  const { lang, t } = useI18n();
  const [nome, setNome] = useLocale<string>("nome", "");
  const [cambiaNome, setCambiaNome] = useState(false);
  const prefs = usePrefsLocali();
  const todo = useListaLocale("todo");
  const esteri = useListaLocale("documentiEsteri");
  const commenti = useCommentiLocali();
  const picking = usePickingLocale(nome);
  const firma = nome || t.defaultUserName;

  const handleAddTool = (values: ToolFormValues) => {
    prefs.addTool({
      title: { it: values.title, en: values.title },
      description: { it: values.description, en: values.description },
      url: values.url,
      icon: values.icon,
      color: values.color || undefined,
      cta: { it: defaultCta(values.icon, "it"), en: defaultCta(values.icon, "en") },
    });
  };

  const handleEditTool = (key: string, values: ToolFormValues) => {
    const current = prefs.tools.find(tool => tool.key === key);
    prefs.editTool(key, {
      title: { ...current?.title, [lang]: values.title } as { it: string; en: string },
      description: { ...current?.description, [lang]: values.description } as { it: string; en: string },
      url: values.url,
      icon: values.icon,
      color: values.color || undefined,
    });
  };

  return (
    <div className="min-h-screen">
      {(!nome || cambiaNome) && (
        <NomeModal
          iniziale={nome}
          onSalva={n => {
            setNome(n);
            setCambiaNome(false);
          }}
          onChiudi={nome ? () => setCambiaNome(false) : undefined}
        />
      )}
      <QuickRail tools={prefs.tools} quick={prefs.quick} onSave={prefs.setQuick} />
      <HeroGemello nome={nome} onCambiaNome={() => setCambiaNome(true)} />
      <OrizzonteEolico />

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 md:pl-22 xl:max-w-[1880px] min-[1980px]:pl-6">
        <section>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr] xl:min-h-[50rem] xl:grid-cols-[260px_minmax(0,1.15fr)_minmax(0,1fr)] 2xl:grid-cols-[290px_minmax(0,1.2fr)_minmax(0,1fr)]">
            <aside className="lg:relative lg:min-h-160">
              <div className="flex flex-col gap-4 lg:absolute lg:inset-0 lg:overflow-y-auto">
                <TodoPanel
                  todos={todo.voci}
                  unseenIds={NESSUNA}
                  onAdd={(text, priority) => todo.aggiungi(text, priority, firma)}
                  onToggle={todo.segna}
                  onSetPriority={todo.priorita}
                  onEditText={todo.modifica}
                  onDelete={todo.elimina}
                  onSeen={niente}
                />
                <div id="sez-migo" className="scroll-mt-4 lg:shrink-0">
                  <MaterialeAccettazione nome={firma} />
                </div>
                <CommentsPanel
                  comments={commenti.voci}
                  unseenIds={NESSUNA}
                  syncStatus=""
                  onAdd={text => commenti.aggiungi(text, firma)}
                  onEditText={commenti.modifica}
                  onDelete={commenti.elimina}
                  onSeen={niente}
                />
              </div>
            </aside>
            <div className="flex min-w-0 flex-col">
              <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-1 border-b-4 border-blue-mid pb-2">
                <h2 className="font-heading text-2xl font-extrabold uppercase leading-none tracking-wide text-blue-dark">{t.toolsLabel}</h2>
                <span className="text-xs text-ink/50">{t.toolsHint}</span>
                <MiniParco />
              </div>
              <ToolsGrid
                tools={prefs.tools}
                onReorder={prefs.reorderTools}
                onAddTool={handleAddTool}
                onEditTool={handleEditTool}
                onDeleteTool={prefs.deleteTool}
                nascosti={prefs.hiddenCount}
                onRipristina={prefs.restoreHidden}
              />
            </div>
            <aside className="lg:col-span-2 xl:relative xl:col-span-1">
              <div className="flex flex-col gap-4 xl:absolute xl:inset-0">
                <TodoPanel
                  variante={PACKING}
                  todos={esteri.voci}
                  unseenIds={NESSUNA}
                  onAdd={(text, priority) => esteri.aggiungi(text, priority, firma)}
                  onToggle={esteri.segna}
                  onSetPriority={esteri.priorita}
                  onEditText={esteri.modifica}
                  onDelete={esteri.elimina}
                  onSeen={niente}
                />
                <PickingPanel
                  voci={picking.voci}
                  nuove={NESSUNA}
                  sigla={firma}
                  onSalva={picking.salva}
                  onAggiorna={picking.aggiorna}
                  onElimina={picking.elimina}
                  onVisto={niente}
                />
              </div>
            </aside>
          </div>
        </section>

        <div id="sez-stampa" className="scroll-mt-4">
          <PrintToolSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
