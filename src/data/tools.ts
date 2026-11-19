import type { IconKey, Tool } from "../types/tool";
import type { Lang, LocalizedText } from "../types/lang";

// To change the layout order, reorder the objects in this array (or drag the
// cards by their grip handle in the page itself). Titles/descriptions can be
// edited directly on the page via the tool's gear icon — editing a tool only
// updates the text for the language currently being viewed; the other
// language keeps its own text.
export const BASE_TOOLS: Tool[] = [
  {
    key: "dntracknew",
    title: { it: "Documento Track New", en: "Documento Track New" },
    description: {
      it: "Nuova app di accettazione documenti: foto, lettura automatica, revisione e scrittura nell'archivio.",
      en: "New document acceptance app: photos, automatic reading, review and writing to the archive.",
    },
    url: "",
    cta: { it: "Apri l'app", en: "Open app" },
    icon: "globe",
  },
  {
    key: "dntrack2",
    title: { it: "Documento Track.2", en: "Documento Track.2" },
    description: {
      it: "Archivio dei documenti.",
      en: "Document archive.",
    },
    url: "",
    cta: { it: "Apri il foglio", en: "Open sheet" },
    icon: "sheet",
  },
  {
    key: "dnacq",
    title: { it: "Documento Track — Acquisizione DDT", en: "Document Track — DDT Capture" },
    description: {
      it: "App per acquisire i DDT fotografati ed estrarne i dati nell'archivio.",
      en: "App to capture photographed delivery notes and extract their data into the archive.",
    },
    url: "",
    cta: { it: "Apri l'app", en: "Open app" },
    icon: "globe",
  },
  {
    key: "archiviodn",
    title: { it: "Archivio documenti e attività", en: "Document & Activity Archive" },
    description: {
      it: "Registro condiviso dei documenti e delle attività.",
      en: "Shared register of documents and activities.",
    },
    url: "",
    cta: { it: "Apri il foglio", en: "Open sheet" },
    icon: "sheet",
  },
  {
    key: "conferma",
    title: { it: "Conferma accettazione", en: "Acceptance Confirmation" },
    description: {
      it: "Tracciabilità dei materiali accettati.",
      en: "Traceability of accepted materials.",
    },
    url: "",
    cta: { it: "Apri il file", en: "Open file" },
    icon: "check",
  },
  {
    key: "documents",
    title: { it: "Documents", en: "Documents" },
    description: {
      it: "Cartella di file condivisa.",
      en: "Shared file folder.",
    },
    url: "",
    cta: { it: "Apri la cartella", en: "Open folder" },
    icon: "folder",
  },
  {
    key: "uscitasp",
    title: {
      it: "Materiali in uscita",
      en: "Outgoing Materials",
    },
    description: {
      it: "Registro dei materiali in uscita dal magazzino.",
      en: "Register of outgoing materials from the warehouse.",
    },
    url: "",
    cta: { it: "Apri il foglio", en: "Open sheet" },
    icon: "sheet",
  },
  {
    key: "portale",
    title: { it: "Portale interno", en: "Internal portal" },
    description: {
      it: "Portale interno aziendale.",
      en: "Internal company portal.",
    },
    url: "",
    cta: { it: "Apri il portale", en: "Open portal" },
    icon: "globe",
  },
  {
    key: "pictures",
    title: { it: "Pictures, Items & Tools", en: "Pictures, Items & Tools" },
    description: {
      it: "Cartella di foto e file condivisa.",
      en: "Shared photo and file folder.",
    },
    url: "",
    cta: { it: "Apri la cartella", en: "Open folder" },
    icon: "folder",
  },
];

// Inline SVG path data (viewBox 0 0 24 24) for each icon key.
export const ICON_PATHS: Record<IconKey, ReactSvgPath[]> = {
  sheet: [
    { d: "M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-4-4h-2" },
    { d: "M8 3v4a1 1 0 0 0 1 1h5" },
    { line: [8, 13, 16, 13] },
    { line: [8, 17, 16, 17] },
  ],
  check: [
    { d: "M9 11l3 3L22 4" },
    { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  ],
  folder: [{ d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" }],
  globe: [
    { circle: [12, 12, 9] },
    { line: [3, 12, 21, 12] },
    { d: "M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" },
  ],
};

type ReactSvgPath =
  | { d: string }
  | { line: [number, number, number, number] }
  | { circle: [number, number, number] };

export const ICON_LABELS: Record<Lang, Record<IconKey, string>> = {
  it: {
    sheet: "Foglio (sheet)",
    check: "Documento",
    folder: "Cartella / archivio",
    globe: "Link generico",
  },
  en: {
    sheet: "Sheet",
    check: "Document",
    folder: "Folder / archive",
    globe: "Generic link",
  },
};

export interface ToolColorOption {
  value: string;
  label: LocalizedText;
}

// 18 options: "no colour" plus 17 accents. Every colour used by an existing
// tool must stay in this list, or that tool's swatch would stop showing as
// selected when its editor is reopened.
export const TOOL_COLORS: ToolColorOption[] = [
  { value: "", label: { it: "Nessuno", en: "None" } },
  { value: "#00205b", label: { it: "Blu notte", en: "Night blue" } },
  { value: "#0057b8", label: { it: "Blu", en: "Blue" } },
  { value: "#0a9bd6", label: { it: "Azzurro", en: "Light blue" } },
  { value: "#00b8d4", label: { it: "Ciano", en: "Cyan" } },
  { value: "#00897b", label: { it: "Verde acqua", en: "Teal" } },
  { value: "#00875a", label: { it: "Verde", en: "Green" } },
  { value: "#689f38", label: { it: "Verde oliva", en: "Olive" } },
  { value: "#afb42b", label: { it: "Lime", en: "Lime" } },
  { value: "#f5a623", label: { it: "Ambra", en: "Amber" } },
  { value: "#e8820c", label: { it: "Arancio", en: "Orange" } },
  { value: "#e65100", label: { it: "Arancio scuro", en: "Dark orange" } },
  { value: "#c8102e", label: { it: "Rosso", en: "Red" } },
  { value: "#d81b60", label: { it: "Rosa", en: "Pink" } },
  { value: "#6b3fa0", label: { it: "Viola", en: "Purple" } },
  { value: "#4527a0", label: { it: "Indaco", en: "Indigo" } },
  { value: "#795548", label: { it: "Marrone", en: "Brown" } },
  { value: "#5a6b7a", label: { it: "Grigio", en: "Grey" } },
];

const DEFAULT_CTA: Record<Lang, Record<IconKey, string>> = {
  it: {
    folder: "Apri la cartella",
    sheet: "Apri il foglio",
    check: "Apri il documento",
    globe: "Apri il link",
  },
  en: {
    folder: "Open folder",
    sheet: "Open sheet",
    check: "Open document",
    globe: "Open link",
  },
};

export function defaultCta(icon: IconKey, lang: Lang): string {
  return DEFAULT_CTA[lang][icon];
}

export const PRIORITY_COLORS: Record<1 | 2 | 3, string> = {
  1: "#6fcf97",
  2: "#f2c94c",
  3: "#eb5757",
};

export const PRIORITY_LABELS: Record<Lang, Record<1 | 2 | 3, string>> = {
  it: { 1: "Bassa", 2: "Media", 3: "Alta" },
  en: { 1: "Low", 2: "Medium", 3: "High" },
};
