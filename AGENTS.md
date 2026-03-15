# AGENTS.md — Dungeons of Duzh

## Project overview

A turn-based graphical roguelike dungeon crawler for the browser, written in TypeScript.
Built with Vite, packaged for web and Electron desktop.

## Build and test

```bash
pnpm install           # install all workspace dependencies
pnpm build             # compile all packages
pnpm test              # run all tests (Vitest)
pnpm test:coverage     # run tests with coverage report
pnpm lint              # format all source files with Prettier
pnpm dev               # start Vite dev server (main package only)
```

Tests live in `__tests__/` directories within each package. Always run `pnpm build` before
`pnpm test` — packages must be compiled before they can be imported by dependents.

## Monorepo structure

This is a PNPM workspace. Packages live under their own directories with their own
`package.json` and `tsconfig.json`. Build order matters: `models`, `utils`, `geometry`,
`graphics`, `audio`, `features`, `maps` are all consumed by `main`.

| Package    | Purpose |
|------------|---------|
| `assets/`  | Game data (JSON models, images, sounds) and asset-bundle build scripts |
| `audio/`   | Web Audio API helpers for sound effects and music playback |
| `electron/`| Electron Forge config for desktop distribution (uses npm, not pnpm) |
| `features/`| Micro-library for boolean feature flags |
| `geometry/`| Coordinate types, grid structures, A* pathfinding |
| `graphics/`| Canvas2D rendering utilities, color/palette handling, image loading |
| `main/`    | Primary game application (~180 TS files) |
| `maps/`    | Procedural and predefined dungeon map generation |
| `models/`  | Zod schemas for all game data models |
| `utils/`   | Generic, game-agnostic helper functions |

## Code conventions

- **Language:** TypeScript 5.x with strict mode
- **Formatting:** Prettier — single quotes, 90-char line width, no trailing commas
- **Style:** OOP for core domain classes (units, equipment, scenes); pure functions elsewhere
- **Naming:** Prefer verbose, unambiguous names over short ones
- **Comments:** Top-of-function purpose comments; avoid inline comments unless genuinely
  counter-intuitive

## Key architectural notes

- Game state flows through `Game` (container) → `Engine` (game loop) → `Scene` (active screen)
- The active scene is one of: `GameScene`, `InventoryScene`, `CharacterScene`, `MapScene`,
  `HelpScene`, `TitleScene`, `VictoryScene`, `GameOverScene`
- Units (player and enemies) are data objects mutated by action functions in `actions/` and
  ability implementations in `abilities/`
- Map generation produces a tile grid + entity placement; `MapHydrator` wires it into game state
- Asset data (units, equipment, items, maps, tilesets) lives as JSON under `assets/data/`
  and is validated at load time by the Zod schemas in `models/`
- The `electron/` package is intentionally outside the PNPM workspace due to Electron's npm
  hoisting requirements; do not add it to `pnpm-workspace.yaml`

## CI

- Push or PR to `master` runs build → test → coverage → lint (`.github/workflows/node.js.yml`)
- Push to `master` also triggers Electron builds for Windows and macOS and creates a GitHub
  release (`.github/workflows/electron-forge.yml`)
