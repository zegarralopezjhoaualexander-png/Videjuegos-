# AGENTS.md

## Stack
- React 19 + Vite 8, JavaScript/JSX only (no TypeScript).
- Tailwind CSS v4 via the `@tailwindcss/vite` plugin. CSS-first: no `tailwind.config.js` or PostCSS config; `src/index.css` is just `@import "tailwindcss";`. Don't add legacy Tailwind/PostCSS config.
- `css` and `tailwind` packages in `package.json` are unused/erroneous; use `tailwindcss` + `@tailwindcss/vite` only.

## Commands
- Dev server: `npm run dev`
- Build: `npm run build` (writes `dist/`)
- Lint: `npm run lint` (ESLint flat config, ignores `dist`)
- Preview build: `npm run preview`
- Test: `npm test` (Vitest + Testing Library, jsdom). Also verify with `npm run lint` and `npm run build`.
- Slow Tailwind `vite:css-post` output / `PLUGIN_TIMINGS` notice on build is expected, not an error.

## Layout
- Entry flow: `index.html` (`#root`) -> `src/main.jsx` -> `src/App.jsx`.
- Global Tailwind styles in `src/index.css`; app/component CSS in `src/App.css` (uses native CSS nesting, imported by `App.jsx`).
- Static assets in `public/` are referenced root-absolute (`/icons.svg`, `/favicon.svg`).
- ESLint's `react-refresh` rule requires files to export only components (keep non-component exports out of JSX component files).
- Not a git repository (`git` commands will fail).

## Diseño centrado en las Personas
Antes de diseñar o modificar cualquier pantalla, lee PERSONAS.md y diseña
pensando en Diego (jugador con presupuesto ajustado que paga con Yape desde
el celular) y en Lucía (compradora cautelosa que necesita confianza y
comprobante).
- Prioriza el uso en celular, los pocos pasos y los mensajes de error claros.
- Muestra siempre el total final y señales de seguridad en el pago.
- Cuando propongas una pantalla, indica a qué Persona beneficia.
Instrucción base: "Diseña las pantallas pensando en las Personas de PERSONAS.md".
