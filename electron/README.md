# @duzh/electron

Configuration for building the game as an Electron executable,
and for distributing it using Electron Forge.

Note that this project is not included in the PNPM workspace.  Electron Forge
relies on specific NPM dependency hoisting behavior, which might be possible
to enable in PNPM but I don't really want to change the behavior of the rest
of the workspace.  Note that we're using a stupid hack in the top-level
`package.json`'s `electron` task to sidestep Electron Forge's `pnpm` check.