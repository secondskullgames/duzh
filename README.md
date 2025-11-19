# Dungeons of Duzh

A graphical Roguelike in the browser written in Typescript.

[![Node.js CI](https://github.com/jwbutler/roguelike-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/jwbutler/roguelike-js/actions/workflows/node.js.yml)

## Package Structure

- `src/` - Typescript source code
  - `lib/` - Library code that is (mostly) not specific to the game
  - `main/` - Main game code
  - `models/` - Zod schema definitions for game data
  - `test/` - Unit tests
- `build/` - Compiled Typescript
- `data/` - Game data in JSON format
- `electron/` - Electron-specific code
- `public/` - Static files for the game

### `data/`
Much of the game data is stored as JSON files in the `data/` directory.
We use Zod to define schemas for each type of game data and validate them at runtime.
The corresponding Zod schemas are in `src/main/models/`.

## Usage
Run the game in dev:
```
npm run dev
```

Run the game as an Electron app:
```
npm run electron
```
