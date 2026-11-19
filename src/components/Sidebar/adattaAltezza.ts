/** Fa crescere una casella di testo con il contenuto (nessuna barra di scorrimento interna). */
export function adattaAltezza(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + 2 + "px";
}
