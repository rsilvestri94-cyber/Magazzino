import { useI18n } from "../i18n/I18nContext";

// Versione 1.<numero di caricamenti su GitHub>: sale da sola a ogni caricamento
const VERSIONE = __HUB_BUILD__ ? `1.${__HUB_BUILD__}` : "1";

function dataPubblicazione(lang: string): string {
    const d = new Date(__HUB_DATA__);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(lang === "it" ? "it-IT" : "en-GB", {
        timeZone: "Europe/Rome",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function Footer() {
    const { lang } = useI18n();
    return (
        <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-ink/50">
            <p>
                {lang === "it" ? (
                    <>
                        Questo hub è stato sviluppato da <strong>Raffaele</strong>, con il supporto di <strong>Gianluca</strong>.
                    </>
                ) : (
                    <>
                        This hub was developed by <strong>Raffaele</strong>, with the support of <strong>Gianluca</strong>.
                    </>
                )}
            </p>
            <p className="mt-1" title={__HUB_COMMIT__ ? "commit " + __HUB_COMMIT__ : undefined}>
                {lang === "it" ? "Versione" : "Version"} {VERSIONE} · {dataPubblicazione(lang)}
            </p>
        </footer>
    );
}
