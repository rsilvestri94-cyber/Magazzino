import { useCallback } from "react";
import { nuovoId } from "./locale";
import { useLista } from "./condivisione";
import type { Priority, Todo } from "../types/todo";
import type { Comment } from "../types/comment";

// To-Do, Documenti esteri e Commenti: nel browser, oppure condivisi con la squadra (vedi condivisione.ts).

export function useListaLocale(chiave: string) {
    const [voci, setVoci] = useLista<Todo>(chiave);
    return {
        voci,
        aggiungi: useCallback(
            (text: string, priority: Priority, author: string) => {
                if (!text.trim()) return;
                setVoci(l => [...l, { id: nuovoId(), text: text.trim(), done: false, priority, author, date: new Date().toISOString() } as Todo]);
            },
            [setVoci],
        ),
        segna: useCallback((v: Todo) => setVoci(l => l.map(x => (x.id === v.id ? { ...x, done: !x.done } : x))), [setVoci]),
        priorita: useCallback((v: Todo, p: Priority) => setVoci(l => l.map(x => (x.id === v.id ? { ...x, priority: p } : x))), [setVoci]),
        modifica: useCallback(
            (v: Todo, text: string) => {
                if (text.trim()) setVoci(l => l.map(x => (x.id === v.id ? { ...x, text: text.trim() } : x)));
            },
            [setVoci],
        ),
        elimina: useCallback((v: Todo) => setVoci(l => l.filter(x => x.id !== v.id)), [setVoci]),
    };
}

export function useCommentiLocali() {
    const [voci, setVoci] = useLista<Comment>("commenti", true);
    return {
        voci,
        aggiungi: useCallback(
            (text: string, author: string) => {
                if (text.trim()) setVoci(l => [{ id: nuovoId(), text: text.trim(), author, date: new Date().toISOString() } as Comment, ...l]);
            },
            [setVoci],
        ),
        modifica: useCallback((v: Comment, text: string) => setVoci(l => l.map(x => (x.id === v.id ? { ...x, text } : x))), [setVoci]),
        elimina: useCallback((v: Comment) => setVoci(l => l.filter(x => x.id !== v.id)), [setVoci]),
    };
}
