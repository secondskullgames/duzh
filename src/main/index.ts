import type MapSpec from './schemas/MapSpec';
import { Debug } from './core/Debug';
import { GameDriver } from './core/GameDriver';
import { GameEngine } from './core/GameEngine';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import MapFactory from './maps/MapFactory';
import { MapSupplier } from './maps/MapSupplier';
import UnitFactory from './units/UnitFactory';
import ItemFactory from './items/ItemFactory';

const addInitialState = async (state: GameState, unitFactory: UnitFactory) => {
  const playerUnit = await unitFactory.createPlayerUnit();
  state.setPlayerUnit(playerUnit);

  const mapSpecs = (await import(
    /* webpackChunkName: "models" */
    `../../data/maps.json`
    )).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(mapSpec => {
    return () => MapFactory.loadMap(mapSpec);
  });
  state.addMaps(maps);
};

const main = async () => {
  const state = new GameState();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state
  });
  const engine = new GameEngine({ state, renderer });
  const gameDriver = new GameDriver({ renderer, state, engine });
  const itemFactory = new ItemFactory({ state, engine });
  const unitFactory = new UnitFactory({ itemFactory });
  await addInitialState(state, unitFactory);
  GameDriver.setInstance(gameDriver);
  GameState.setInstance(state);
  GameEngine.setInstance(engine);
  ItemFactory.setInstance(itemFactory);
  UnitFactory.setInstance(unitFactory);
  const debug = new Debug({ engine, state });
  debug.attachToWindow();
  await engine.render();
  await engine.preloadFirstMap();
};

main().catch(e => {
  console.error(e);
  alert(e)
});
