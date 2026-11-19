import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import type { Tool } from "../../types/tool";
import type { ToolFormValues } from "./ToolForm";
import { ToolCard } from "./ToolCard";
import { AddTile } from "./AddTile";

export function ToolsGrid({
  tools,
  onReorder,
  onAddTool,
  onEditTool,
  onDeleteTool,
  nascosti = 0,
  onRipristina,
}: {
  tools: Tool[];
  onReorder: (tools: Tool[]) => void;
  onAddTool: (values: ToolFormValues) => void;
  onEditTool: (key: string, values: ToolFormValues) => void;
  onDeleteTool?: (key: string) => void;
  /** strumenti del catalogo eliminati dalla propria griglia */
  nascosti?: number;
  onRipristina?: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // Righe tutte alte uguali; mentre si modifica o si aggiunge uno strumento il modulo ha la sua altezza
  const righeUguali = editingKey === null && !adding;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tools.findIndex(t => t.key === active.id);
    const newIndex = tools.findIndex(t => t.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(tools, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tools.map(t => t.key)} strategy={rectSortingStrategy}>
        {/* le colonne dipendono dalla larghezza dell'area strumenti, non dello schermo:
            3 colonne appena c'è spazio, anche con To-Do e Materiale in accettazione ai lati */}
        <div className="@container">
        <div className={`grid grid-cols-1 @min-[340px]:grid-cols-2 @min-[480px]:grid-cols-3 gap-3 ${righeUguali ? "auto-rows-fr" : ""}`}>
          {tools.map(tool => (
            <ToolCard
              key={tool.key}
              tool={tool}
              editing={editingKey === tool.key}
              onStartEdit={() => setEditingKey(tool.key)}
              onCancelEdit={() => setEditingKey(null)}
              onSave={values => {
                onEditTool(tool.key, values);
                setEditingKey(null);
              }}
              onDelete={
                onDeleteTool
                  ? () => {
                      setEditingKey(null);
                      onDeleteTool(tool.key);
                    }
                  : undefined
              }
            />
          ))}
          <AddTile onAdd={onAddTool} onOpenChange={setAdding} />
        </div>
        {nascosti > 0 && onRipristina && (
          <p className="mt-3 text-center text-xs text-ink/50">
            {nascosti === 1 ? "1 strumento eliminato dalla tua griglia" : `${nascosti} strumenti eliminati dalla tua griglia`} ·{" "}
            <button type="button" onClick={onRipristina} className="font-semibold text-blue-mid hover:underline">
              Falli ricomparire
            </button>
          </p>
        )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
