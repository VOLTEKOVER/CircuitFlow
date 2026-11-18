# CircuitFlow

Piattaforma web per lo studio dell’elettronica avanzata, con libreria di simulazioni interattive (teoria, schemi, parametri, grafici e analisi).

## Stack

- [Nuxt 4](https://nuxt.com/) + [Nuxt UI](https://ui.nuxt.com/)
- Vue 3, TypeScript, Tailwind CSS
- Visualizzazioni interattive realizzate con SVG/Canvas

## Sviluppo

Installazione dipendenze:

```bash
npm install
```

Avvio server di sviluppo (`http://localhost:3000`):

```bash
npm run dev
```

Controlli:

```bash
npm run lint
npm run typecheck
```

## Build

```bash
npm run build
npm run preview
```

## Struttura principale

- `app/pages/` — pagine e libreria simulazioni (`/libreria/...`)
- `app/components/SimulationShell.vue` — layout universale delle pagine di simulazione
- `app/utils/simulations.ts` — catalogo delle simulazioni
- `app/assets/css/main.css` — stili e tema
