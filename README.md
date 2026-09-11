# React + Vite

## Book Canvas Development

All book previews must use `src/utils/bookCanvasLoop.js` for sizing, visibility and cleanup, and `src/utils/bookAnimation.js` for fixed-step updates and interpolated drawing. Do not add per-frame layout reads or reduce sprite quality to hide performance problems. Full animal simulations use `src/utils/pausedFrameGate.js` to reuse paused frames.

See [the book implementation and reference log](animal-book-references.md) for the data contract, source status and shared canvas performance requirements.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
