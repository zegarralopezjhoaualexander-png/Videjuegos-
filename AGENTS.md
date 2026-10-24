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
- No test runner, no typecheck script. Don't claim tests ran; verify with `npm run lint` and `npm run build`.
- Slow Tailwind `vite:css-post` output / `PLUGIN_TIMINGS` notice on build is expected, not an error.

## Layout
- Entry flow: `index.html` (`#root`) -> `src/main.jsx` -> `src/App.jsx`.
- Global Tailwind styles in `src/index.css`; app/component CSS in `src/App.css` (uses native CSS nesting, imported by `App.jsx`).
- Static assets in `public/` are referenced root-absolute (`/icons.svg`, `/favicon.svg`).
- ESLint's `react-refresh` rule requires files to export only components (keep non-component exports out of JSX component files).
- Not a git repository (`git` commands will fail).
