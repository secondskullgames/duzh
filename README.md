# Dungeons of Duzh

A graphical Roguelike in the browser written in Typescript.

## Gameplay

* WASD / Arrow keys - Move around, melee attack 
* Tab - Open inventory screen
* Enter - Pick up item, enter portal, go down stairs
* Number keys (1-9) - Special moves (press arrow to execute)
* Shift + (direction) - Use bow and arrows
* Alt + (direction) - Dash
* M - View map screen
* C - View character screen
* F1 - View help screen

## Package Structure

This is a PNPM monorepo divided into a number of modules:

- `assets/` - contains game data in the form of JSON models and images, as well as scripts for building JSON asset bundles
- `audio/` - helpers for playing sound and music files
- `electron/` - configuration for deploying as an Electron app
- `features/` - micro-library for toggling various boolean flags
- `geometry/` - contains definitions of common geometric types, as well as pathfinding
- `graphics/` - utilities for rendering via Canvas2D and dealing with images
- `main/` - the main application code
- `maps/` - code for procedural map generation as well as loading predefined maps from images
- `models/` - Zod schemas for core game objects.
- `utils/` - generic helper functions that are generally not game-specific.

## Developing

Compile the game:
```
pnpm build
```

Run the game in dev:
```
pnpm dev
```

Run the game as an Electron app:
```
pnpm electron
```
