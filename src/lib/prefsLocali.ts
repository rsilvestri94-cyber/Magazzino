import { useCallback, useMemo } from "react";
import { composeTools } from "./composeTools";
import { useLocale, nuovoId } from "./locale";
import { EMPTY_PREFS, type Tool, type ToolPrefs } from "../types/tool";

// Disposizione dei Tools (ordine, colori, strumenti aggiunti o nascosti) e barra laterale,
// salvate nel browser.
export function usePrefsLocali() {
    const [prefs, setPrefs] = useLocale<ToolPrefs>("prefs", EMPTY_PREFS);
    const tools = useMemo(() => composeTools(prefs), [prefs]);
    const cambia = useCallback((campi: Partial<ToolPrefs>) => setPrefs(p => ({ ...p, ...campi })), [setPrefs]);

    return {
        tools,
        quick: prefs.quick,
        hiddenCount: (prefs.hidden || []).length,
        reorderTools: useCallback((l: Tool[]) => cambia({ order: l.map(t => t.key) }), [cambia]),
        addTool: useCallback(
            (input: Omit<Tool, "key">) => {
                const tool: Tool = { ...input, key: "custom_" + nuovoId() };
                const custom = [...prefs.custom, tool];
                cambia({ custom, order: composeTools({ ...prefs, custom }).map(t => t.key) });
            },
            [prefs, cambia],
        ),
        editTool: useCallback(
            (key: string, patch: Partial<Tool>) => {
                if (prefs.custom.some(t => t.key === key)) cambia({ custom: prefs.custom.map(t => (t.key === key ? { ...t, ...patch, key } : t)) });
                else {
                    const pulito = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v === undefined ? "" : v]));
                    cambia({ overrides: { ...prefs.overrides, [key]: { ...prefs.overrides[key], ...pulito } } });
                }
            },
            [prefs, cambia],
        ),
        deleteTool: useCallback(
            (key: string) => {
                const mio = prefs.custom.some(t => t.key === key);
                cambia({
                    custom: mio ? prefs.custom.filter(t => t.key !== key) : prefs.custom,
                    hidden: mio ? prefs.hidden || [] : [...new Set([...(prefs.hidden || []), key])],
                    order: (prefs.order || []).filter(k => k !== key),
                });
            },
            [prefs, cambia],
        ),
        restoreHidden: useCallback(() => cambia({ hidden: [] }), [cambia]),
        setQuick: useCallback((quick: string[]) => cambia({ quick }), [cambia]),
    };
}
