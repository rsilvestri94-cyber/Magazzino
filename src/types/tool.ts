import type { LocalizedText } from "./lang";

export type IconKey = "sheet" | "check" | "folder" | "globe";

export interface Tool {
  key: string;
  title: LocalizedText;
  description: LocalizedText;
  url: string;
  cta: LocalizedText;
  icon: IconKey;
  color?: string;
}

export interface ToolPrefs {
  order: string[];
  overrides: Record<string, Partial<Tool>>;
  custom: Tool[];
  /** Pulsanti della barra laterale ("sez:stampa", "tool:dntracknew"…); assente = predefiniti */
  quick?: string[];
  /** strumenti del catalogo eliminati dalla propria griglia */
  hidden?: string[];
  /** assistente: benvenuto già mostrato e ultima novità vista */
  guida?: { benvenuto?: boolean; novita?: string };
}

export const EMPTY_PREFS: ToolPrefs = { order: [], overrides: {}, custom: [] };
