import type { Lang } from "../types/lang";

export interface Strings {
  toolsLabel: string;
  toolsHint: string;
  todoTitle: string;
  todoPlaceholder: string;
  todoAddTitle: string;
  priorityLabel: string;
  printLabel: string;
  printSub: string;
  addToolTile: string;
  formTitleLabel: string;
  formDescLabel: string;
  formLinkLabel: string;
  formTypeLabel: string;
  formColorLabel: string;
  formSave: string;
  formAdd: string;
  formCancel: string;
  formTitlePlaceholder: string;
  formDescPlaceholder: string;
  gearTitle: string;
  dragTitle: string;
  emptyTodos: string;
  emptyActiveTodos: string;
  emptyDoneTodos: string;
  filterActive: string;
  filterDone: string;
  filterAll: string;
  deleteTaskTitle: string;
  markDoneTitle: string;
  markUndoTitle: string;
  noDescription: string;
  progress: (done: number, total: number) => string;
  defaultUserName: string;
  commentsTitle: string;
  commentPlaceholder: string;
  commentAddBtn: string;
  deleteCommentTitle: string;
  emptyComments: string;
  syncSynced: string;
  syncError: string;
}

export const I18N: Record<Lang, Strings> = {
  it: {
    toolsLabel: "Tools",
    toolsHint:
      "trascina i riquadri per riordinarli · premi l'icona ⚙ per modificarli",
    todoTitle: "To-Do List",
    todoPlaceholder: "Nuova attività...",
    todoAddTitle: "Aggiungi attività",
    priorityLabel: "Priorità",
    printLabel: "Stampa attività",
    printSub: "Incolla le righe dall'Excel e stampa le schede (2 per foglio A4)",
    addToolTile: "Aggiungi strumento",
    formTitleLabel: "Titolo",
    formDescLabel: "Descrizione",
    formLinkLabel: "Link",
    formTypeLabel: "Tipo",
    formColorLabel: "Colore",
    formSave: "Salva",
    formAdd: "Aggiungi",
    formCancel: "Annulla",
    formTitlePlaceholder: "Nome dello strumento",
    formDescPlaceholder: "Breve descrizione",
    gearTitle: "Modifica questo strumento",
    dragTitle: "Trascina per riordinare",
    emptyTodos: "Nessuna attività. Aggiungine una qui sopra.",
    emptyActiveTodos: "Nessuna attività da fare.",
    emptyDoneTodos: "Nessuna attività completata.",
    filterActive: "Da fare",
    filterDone: "Completate",
    filterAll: "Tutte",
    deleteTaskTitle: "Elimina attività",
    markDoneTitle: "Segna come completata",
    markUndoTitle: "Segna come da fare",
    noDescription: "Nessuna descrizione.",
    progress: (done, total) => `${done} / ${total} completate`,
    defaultUserName: "Anonimo",
    commentsTitle: "Commenti",
    commentPlaceholder: "Scrivi un appunto...",
    commentAddBtn: "Aggiungi",
    deleteCommentTitle: "Elimina commento",
    emptyComments: "Nessun commento. Scrivine uno qui sopra.",
    syncSynced: "Sincronizzato",
    syncError: "Sync non disponibile — salvo solo su questo browser",
  },
  en: {
    toolsLabel: "Tools",
    toolsHint: "drag the tiles to reorder them · press the ⚙ icon to edit them",
    todoTitle: "To-Do List",
    todoPlaceholder: "New task...",
    todoAddTitle: "Add task",
    priorityLabel: "Priority",
    printLabel: "Print activities",
    printSub: "Paste the rows from Excel and print the cards (2 per A4 sheet)",
    addToolTile: "Add tool",
    formTitleLabel: "Title",
    formDescLabel: "Description",
    formLinkLabel: "Link",
    formTypeLabel: "Type",
    formColorLabel: "Color",
    formSave: "Save",
    formAdd: "Add",
    formCancel: "Cancel",
    formTitlePlaceholder: "Tool name",
    formDescPlaceholder: "Short description",
    gearTitle: "Edit this tool",
    dragTitle: "Drag to reorder",
    emptyTodos: "No tasks yet. Add one above.",
    emptyActiveTodos: "No open tasks.",
    emptyDoneTodos: "No completed tasks.",
    filterActive: "To do",
    filterDone: "Completed",
    filterAll: "All",
    deleteTaskTitle: "Delete task",
    markDoneTitle: "Mark as done",
    markUndoTitle: "Mark as to-do",
    noDescription: "No description.",
    progress: (done, total) => `${done} / ${total} completed`,
    defaultUserName: "Anonymous",
    commentsTitle: "Comments",
    commentPlaceholder: "Write a note...",
    commentAddBtn: "Add",
    deleteCommentTitle: "Delete comment",
    emptyComments: "No comments yet. Write one above.",
    syncSynced: "Synced",
    syncError: "Sync unavailable — saving to this browser only",
  },
};
