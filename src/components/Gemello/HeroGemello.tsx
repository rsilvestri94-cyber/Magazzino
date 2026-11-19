import { useState } from "react";
import { User, Volume2, VolumeX } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";
import { TurbineIcon } from "../Hero/TurbineIcon";
import * as notifySound from "../../lib/notifySound";

// Testata del sito gemello: niente logo, niente accesso. Solo lingua, audio e il nome di chi usa il sito.
const PILL_CLASS =
    "flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.13] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.22] cursor-pointer";
const ICON_PILL_CLASS = "flex items-center justify-center rounded-full border border-white/15 bg-white/[0.13] p-2 text-white transition hover:bg-white/[0.22]";

export function HeroGemello({ nome, onCambiaNome }: { nome: string; onCambiaNome: () => void }) {
    const { lang, setLang } = useI18n();
    const [muted, setMuted] = useState(notifySound.isMuted());

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-dark to-blue-mid p-6">
            <TurbineIcon className="pointer-events-none absolute bottom-[-6%] left-[4%] w-[130px] text-white/10" />
            <TurbineIcon className="pointer-events-none absolute bottom-[-8%] left-[20%] w-[90px] text-white/[.16]" />
            <TurbineIcon className="pointer-events-none absolute right-[10%] bottom-[-6%] w-[160px] text-white/[.12]" />
            <TurbineIcon className="pointer-events-none absolute right-[26%] bottom-[-4%] w-[70px] text-white/[.18]" />
            <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2">
                <div className="flex gap-0.5 rounded-full border border-white/30 bg-white/[0.13] p-0.5" role="group" aria-label="Language / Lingua">
                    {(["it", "en"] as const).map(code => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => setLang(code)}
                            className={`rounded-full px-3 py-1.5 font-heading text-[0.68rem] font-bold tracking-wide transition ${lang === code ? "bg-accent text-white" : "text-white/75 hover:text-white"}`}
                        >
                            {code.toUpperCase()}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        notifySound.setMuted(!muted);
                        setMuted(!muted);
                    }}
                    title={muted ? "Suoni spenti" : "Suoni accesi"}
                    className={ICON_PILL_CLASS}
                >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button type="button" onClick={onCambiaNome} title="Cambia nome" className={PILL_CLASS}>
                    <User size={14} />
                    <span>{nome || "Il tuo nome"}</span>
                </button>
            </div>
            <div className="relative z-10 py-6">
                <h1 className="font-heading text-3xl font-black text-white">
                    Warehouse <span className="font-light text-accent">HUB Organizer</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80">
                    {lang === "it"
                        ? "Punto unico per il magazzino: strumenti, attività da fare, materiale in accettazione, documenti esteri, picking e stampa delle attività."
                        : "One place for the warehouse: tools, to-do, materials awaiting acceptance, foreign documents, picking and activity printing."}
                </p>
            </div>
        </div>
    );
}

/** Al primo accesso: solo il nome (niente cognome, niente sigla). */
export function NomeModal({ iniziale, onSalva, onChiudi }: { iniziale: string; onSalva: (n: string) => void; onChiudi?: () => void }) {
    const [nome, setNome] = useState(iniziale);
    const pulito = nome.trim().split(/\s+/)[0] || "";
    return (
        <div role="dialog" aria-modal="true" aria-label="Il tuo nome" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (pulito) onSalva(pulito.charAt(0).toUpperCase() + pulito.slice(1));
                }}
                className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            >
                <h2 className="font-heading text-lg font-bold text-blue-dark">Come ti chiami?</h2>
                <p className="mt-1 text-sm text-ink/60">Solo il nome: compare accanto a ciò che aggiungi o spunti. Resta salvato su questo browser.</p>
                <input
                    autoFocus
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Nome"
                    aria-label="Nome"
                    className="mt-3 w-full rounded-lg border-2 border-grey-line px-3 py-2 outline-none focus:border-accent"
                />
                <div className="mt-4 flex justify-end gap-2">
                    {onChiudi && (
                        <button type="button" onClick={onChiudi} className="rounded-full px-4 py-1.5 text-sm font-bold text-ink/60 hover:bg-grey-bg">
                            Annulla
                        </button>
                    )}
                    <button type="submit" disabled={!pulito} className="rounded-full bg-blue-dark px-5 py-1.5 text-sm font-bold text-white hover:bg-blue-mid disabled:opacity-40">
                        Salva
                    </button>
                </div>
            </form>
        </div>
    );
}
