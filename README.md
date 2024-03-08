# Dungeons of Duzh

A graphical Roguelike in the browser written in Typescript.

[![Node.js CI](https://github.com/jwbutler/roguelike-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/jwbutler/roguelike-js/actions/workflows/node.js.yml)

## Package Structure

- `src/` - Typescript source code
  - `gen-schema/` - Generated json-schema files, generated from models in `src/models/` 
  - `lib/` - Library code that is (mostly) not specific to the game
  - `main/` - Main game code
  - `models/` - Typescript definitions for game data
  - `test/` - Unit tests
- `data/` - Game data in JSON format
- `dist/` - Compiled Typescript
- `electron/` - Electron-specific code
- `public/` - Static files for the game
- `scripts/` - Utility scripts, including for json-schema generation

### `data/`
Much of the game data is stored as JSON files in the `data/` directory.
The corresponding JSON-Schema schemas are in `schemas/`.
We use `typescript-json-schema` to generate these schemas from regular Typescript definitions.
We use `ajv` to validate schemas at runtime, as well as statically during tests (`src/test/schema.test.ts`).

## Usage
Run the game in dev:
```
npm run serve
```

Run the game as an Electron app:
```
npm run electron
```
