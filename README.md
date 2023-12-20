# Dungeons of Duzh

A graphical Roguelike in the browser written in Typescript.

[![Node.js CI](https://github.com/jwbutler/roguelike-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/jwbutler/roguelike-js/actions/workflows/node.js.yml)

## Usage
Run the game in dev:
```
npm run serve
```

Run the game as an Electron app:
```
npm run electron
```

## Data
Much of the game data is stored as JSON files in the `data/` directory.
The corresponding JSON-Schema schemas are in `schemas/`.
We use `json-schema-to-typescript` to compile these to Typescript files in the `src/gen-schema` directory.
We use `ajv` to validate schemas at runtime, as well as statically during tests (`src/test/schema.test.ts`).
