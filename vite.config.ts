import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Versione automatica:
// numero = quanti caricamenti (commit) ci sono su GitHub, data = giorno dell'ultimo caricamento.
function git(cmd: string): string {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
}
function infoVersione() {
  try {
    // GitHub a volte scarica solo l'ultimo commit: prima recupera la storia completa
    if (git('git rev-parse --is-shallow-repository') === 'true') {
      try { git('git fetch --unshallow --quiet') } catch { /* senza rete: si usa il ripiego sotto */ }
    }
    const completo = git('git rev-parse --is-shallow-repository') !== 'true'
    return {
      numero: completo ? git('git rev-list --count HEAD') : process.env.GITHUB_RUN_NUMBER || '',
      data: git('git log -1 --format=%cI'),
      commit: git('git rev-parse --short HEAD'),
    }
  } catch {
    return { numero: process.env.GITHUB_RUN_NUMBER || '', data: new Date().toISOString(), commit: '' }
  }
}
const versione = infoVersione()

// https://vite.dev/config/
// Sito statico, nessun server.
export default defineConfig({
  // percorso relativo: funziona con qualunque nome di repository su GitHub Pages
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    __HUB_BUILD__: JSON.stringify(versione.numero),
    __HUB_DATA__: JSON.stringify(versione.data),
    __HUB_COMMIT__: JSON.stringify(versione.commit),
  },
})
