import type { CSSProperties } from "react";

// Turbine stilizzate a 3 pale, disegnate qui (nessuna immagine esterna).
// Le pale girano piano; chi ha "riduci animazioni" attivo nel sistema le vede ferme (vedi index.css).

function Turbina({ x, base, h, r, ang = 0, colore, op = 1, giro }: { x: number; base: number; h: number; r: number; ang?: number; colore: string; op?: number; giro?: number }) {
    const hubY = base - h;
    const pala = `M0 0 C ${r * 0.07} ${-r * 0.25}, ${r * 0.09} ${-r * 0.7}, ${r * 0.02} ${-r} L ${-r * 0.015} ${-r} C ${-r * 0.04} ${-r * 0.6}, ${-r * 0.05} ${-r * 0.25}, 0 0 Z`;
    const tw = Math.max(1.2, h * 0.018);
    const rotore: CSSProperties | undefined = giro
        ? { transformBox: "view-box", transformOrigin: `${x}px ${hubY}px`, animationDuration: `${giro}s` }
        : undefined;
    return (
        <g opacity={op} fill={colore}>
            <path d={`M${x - tw} ${base} L${x - tw * 0.45} ${hubY} L${x + tw * 0.45} ${hubY} L${x + tw} ${base} Z`} />
            <g className={giro ? "hub-rotore" : undefined} style={rotore}>
                <g transform={`translate(${x} ${hubY}) rotate(${ang})`}>
                    {[0, 120, 240].map(a => (
                        <path key={a} d={pala} transform={`rotate(${a})`} />
                    ))}
                </g>
            </g>
            <circle cx={x} cy={hubY} r={Math.max(1.5, r * 0.05)} />
        </g>
    );
}

// [x, base, altezza, raggio pale, angolo iniziale, secondi per giro]
const PARCO: [number, number, number, number, number, number][] = [
    [40, 195, 70, 30, 10, 21],
    [150, 190, 105, 42, 60, 24],
    [280, 192, 130, 52, 30, 27],
    [400, 190, 95, 40, 90, 22],
    [500, 194, 115, 46, 45, 26],
    [590, 196, 75, 32, 75, 19],
];

/** Fondo della testata: collina che sale dallo sfondo della pagina, con un parco eolico sul crinale. */
export function OrizzonteEolico() {
    return (
        <div className="pointer-events-none relative z-10 -mt-[200px] h-[200px] overflow-x-clip" aria-hidden="true">
            {/* Turbine: tra il testo della testata e il logo, così non coprono niente */}
            <svg
                viewBox="0 0 640 200"
                overflow="visible"
                preserveAspectRatio="xMidYMax meet"
                className="absolute bottom-0 left-[max(50%,44rem)] right-[17%] hidden h-full xl:block"
            >
                {PARCO.map(([x, b, h, r, a, g], i) => (
                    <Turbina key={i} x={x} base={b} h={h} r={r} ang={a} colore="#ffffff" op={0.5} giro={g} />
                ))}
            </svg>
            {/* Collina su due livelli, come l'onda dei Tools colorati: prima una fascia azzurra chiara,
                poi lo sfondo della pagina. Insieme coprono la base delle turbine. */}
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path d="M0 200 L0 180 C 250 173, 425 183, 645 162 S 970 139, 1205 144 S 1385 154, 1440 147 L1440 200 Z" fill="#9cbbdb" />
                <path d="M0 200 L0 188 C 240 182, 420 190, 640 170 S 960 148, 1200 152 S 1380 162, 1440 156 L1440 200 Z" fill="var(--color-grey-bg)" />
            </svg>
        </div>
    );
}

/** Tre piccole turbine appoggiate sulla riga del titolo TOOLS. */
export function MiniParco() {
    return (
        <svg viewBox="0 -13 150 53" overflow="visible" className="-mb-2 ml-auto hidden h-[53px] w-[150px] shrink-0 sm:block" aria-hidden="true">
            <Turbina x={30} base={40} h={26} r={12} colore="#0052a5" giro={6} />
            <Turbina x={78} base={40} h={34} r={15} ang={40} colore="#0052a5" giro={8} />
            <Turbina x={124} base={40} h={22} r={10} ang={80} colore="#0052a5" giro={5} />
        </svg>
    );
}
