# Architecture Analysis

## What works well

### Data-driven models system

The Zod schema approach in `models/` is solid. JSON data is purely declarative with zero
business logic, all data is runtime-validated at load time, and TypeScript gets full type
inference via `z.infer<>`. Factories (`UnitFactory`, `ItemFactory`, `TileFactory`) follow a
consistent pattern: load a validated model, instantiate a runtime object.

The palette-swap system for sprite recoloring is a clean, data-driven way to get visual
variety out of a small asset set.

### Monorepo split

The dependency graph has clean leaf packages with no interdependencies — `utils`, `models`,
`geometry`, and `features` are safe roots that everything else can depend on without risk of
cycles. The `graphics` abstraction (a `Graphics` interface with `CanvasGraphics` and
`OffscreenCanvasGraphics` implementations) is a good seam.

Keeping `electron/` outside the PNPM workspace is the right call given Electron Forge's npm
hoisting requirements.

### Homebrew rendering

Direct canvas control makes pixel-perfect retro graphics trivial. The renderer pattern —
stateless objects that paint given a `Graphics` context — is clean and consistent across all
scenes. Adding a new screen requires implementing `Scene`, writing a renderer, and registering
it; the structure is obvious and repeatable.

---

## What doesn't work well

### Data-driven models: incomplete in practice

The models system is applied inconsistently. Units and equipment are cleanly declarative, but
consumable items break the pattern: `ItemFactory` is a large switch statement on `model.type`,
with nested switches on `model.params?.spell`. Params are typed as `Record<string, string>` and
parsed manually (e.g., string-to-int for damage values). Adding a new consumable type requires
code changes — the system isn't actually data-driven at the item level.

No cross-reference validation is done when loading the asset bundle. If a unit's JSON
references a nonexistent equipment ID or ability name, the error surfaces at runtime during
map hydration, not at startup. Ability names in particular are raw strings with no compile-time
or load-time check.

### Monorepo split: one bad edge

`maps` depends on `graphics` (per `maps/package.json`), but map generation code doesn't
actually use graphics. This looks like historical debt. It means a graphics change forces a
`maps` rebuild unnecessarily and muddies the dependency graph.

`MapHydrator` lives in `main/src/` but serves as the bridge between the `maps` package's
templates and `main`'s factories. The split is workable but awkward — the hydrator is the
most coupled file in the codebase, touching nearly every factory.

### Homebrew rendering: scaling limits

Layout is manual pixel coordinates throughout. There's no component model, so UI elements
(buttons, panels, text blocks) can't be defined once and reused. If the game grows to more
screens or the HUD gets more complex, the renderers will become hard to maintain. The single
previous-scene history in `GameState` (`showPrevScene()`) is already noted as a TODO to make
into a stack.

### GameState does too much

`GameState` manages scene navigation, active scene tracking, inventory UI state, shrine menu
state, unit registry, map registry, ability queue, and turn timers — in one class. It's the
accumulation point for everything that didn't have an obvious home. The scene lookup is O(n)
over an array; simple to fix but symptomatic of the class not being designed, just grown.

### Engine assumptions

`Engine.playTurn()` only advances the map the player is currently on. It also hardcodes
player-first turn order and does no error recovery if a unit's turn throws — there's a comment
acknowledging this as a "super hack." Single-map / single-player assumptions are fine for the
current design but will need addressing if the game adds any multi-zone mechanics.

### Animation architecture

Animations are driven by mutating unit state and blocking on `sleep()`. The pattern, visible
in `attackUnit` and `shootFirebolt`, is always the same:

1. Mutate unit state — `unit.setActivity(Activity.ATTACKING, 1, direction)`,
   `target.getEffects().addEffect(StatusEffect.DAMAGED, 1)`, add a projectile to the map
2. `await sleep(N)` — hold the turn open while the render loop picks up the new state
3. Apply domain effects — deal damage, call `die()`
4. `await sleep(N)` again
5. Reset unit state — `setActivity(Activity.STANDING, ...)`, remove the projectile

`UnitSprite` is passive and actually fine: it is bound to a `Unit` at construction and reads
`activity`, `direction`, and `frameNumber` each render tick to compute the sprite frame key.
The rendering side is a clean observer of unit state.

The problem is the sequencing. Turn processing is async not because domain logic requires it
but because animation timing does. A full turn cannot resolve until every animation in it has
played to completion, which means:

- AI turns take exactly as long wall-clock time as player turns
- Domain effects (damage, death) are interleaved with `await sleep()` calls, so it is
  impossible to advance game state without also running animations
- `shootFirebolt` animates projectile movement by adding a projectile to the map, sleeping
  50ms, removing it, and repeating per tile — the domain and presentation are completely
  tangled

### Actions layer

`main/src/actions/` is a flat pile of 25 async functions covering combat, movement, death,
item drops, level-up, and map events. The standalone-function shape is fine, but two
structural problems run through most of them:

**`Game` as a service locator.** Every action accepts a `Game` parameter and extracts
whatever it needs from inside (`soundController`, `state`, `ticker`, `objectFactory`, etc.).
The actual dependencies of each function are invisible at the call site and only discoverable
by reading the body. Testing any action in isolation requires constructing a mock of the
entire `Game` bag — plus mocking transitive calls, since actions call each other
(`attackUnit` → `die` → `gameOver`, `recordKill` → `levelUp`) as module-level imports.

**Domain logic and presentation are fused.** `attackUnit` interleaves damage calculation
with `sleep()` animation delays, `setActivity` calls, sound playback, and log messages. The
question "does combat produce the right damage?" cannot be answered without also dealing with
timers and sound. This pattern appears across `die`, `walk`, `moveUnit`, and others.

A few actions are genuinely clean (`dealDamage`, `updateRevealedTiles`) but they are the
exception.

### Tests

The test suite is sparse. The `NormalAttack` test is disabled with a comment saying the
author isn't motivated to fix it. `MapUtils` has five cases for one function. The geometry
package is reasonably tested; the core game logic (combat, AI, engine turn loop, scene
transitions) is essentially untested. There's no coverage enforcement in CI.

---

## Opportunities for improvement

### Typed item parameters (high value, moderate effort)

Replace `params: Record<string, string>` with discriminated union schemas in `models/`:

```typescript
const ScrollModel = z.discriminatedUnion('spell', [
  z.object({ spell: z.literal('FIREBALL'), damage: z.number() }),
  z.object({ spell: z.literal('HEAL'), amount: z.number() }),
  // ...
]);
```

This eliminates the switch statements in `ItemFactory` and makes the data actually
data-driven. Each spell type becomes its own schema; adding one is a JSON + schema change
with no factory code change.

### Load-time reference validation

After loading the asset bundle, walk all models and validate that every referenced ID
(equipment IDs on units, ability names on units/equipment, tileset IDs on maps) exists in the
bundle. Fail fast at startup rather than at runtime mid-game. This is one pass over the data
and could live in `buildAssetBundle.ts` or a dedicated validator.

### Scene stack

Replace the single `previousScene` in `GameState` with a proper stack. This is a small
change and would make it possible to open sub-menus (e.g., an item detail view from
inventory) without special-casing each transition. The `TODO` is already there — it just
needs doing.

### Split GameState

Extract distinct responsibilities from `GameState`:
- `SceneRouter` — scene stack, navigation
- `UnitRegistry` — unit tracking, keyed by ID for O(1) lookup
- `TurnState` — in-progress flag, ability queue, turn counter

`GameState` could then compose these rather than implementing everything itself.

### Animation queue (high value, high effort)

Replace the `sleep()`-driven animation model with an animation queue. Domain actions run to
completion immediately, emitting animation events as a side channel. The render loop drains
the queue, playing timed animations at whatever speed the presentation layer chooses. Unit
state changes (damage taken, death, movement) happen at domain speed; the visual
representation catches up asynchronously.

The passive `UnitSprite` / `DynamicSprite` observer pattern is already correct — it is the
action side that needs to change. The concrete steps would be:

1. Strip `sleep()` calls and `setActivity` calls out of actions; actions become synchronous
   or near-synchronous
2. Define an animation event type (e.g. `AttackAnimation`, `ProjectileAnimation`,
   `DeathAnimation`) emitted by actions
3. Have the render loop consume events and play them at its own pace

This also fixes the turn-speed coupling: AI turns would resolve instantly with no perceptible
delay, which would allow for future features like turn replays or fast-forward mode.

### Separate domain logic from presentation in actions (high value, high effort)

The two structural problems in the actions layer have a common fix: separate what happens
from how it is presented. Domain functions would compute and apply state changes and return
a result; a presentation layer would consume that result to play sounds, run animations, and
write log messages. Domain functions would declare their actual dependencies rather than
taking `Game`. This would make the core game logic testable without mocking timers, sound
controllers, or log sinks.

This is a significant refactor — the `sleep()` calls in `attackUnit` are the sharpest
expression of the problem and the hardest to untangle — but the payoff is that combat,
movement, and death logic become straightforwardly unit-testable.

### A few targeted tests

Rather than pursuing coverage broadly, three test areas would give the most confidence:
1. `Engine.playTurn()` with simple mock units — verifies turn order and upkeep
2. Combat damage calculation in `UnitUtils` — pure functions, easy to test, high impact
3. Asset bundle cross-reference validation (once written) — guards against bad data shipping

---

## Summary table

| Area | Verdict |
|------|---------|
| Zod models | Good foundation, inconsistently applied |
| Monorepo structure | Good |
| Homebrew renderer | Right for current scope; will struggle if UI grows significantly |
| GameState | Too large; should be split |
| Engine | Simple and readable; assumptions too narrow |
| Item system | Switch-driven; should be schema-driven like units |
| Animation | `sleep()`-driven; domain and presentation serialized through the turn loop |
| Actions layer | `Game` service locator + fused presentation make logic untestable |
| Tests | Insufficient; a few targeted tests would meaningfully improve confidence |
