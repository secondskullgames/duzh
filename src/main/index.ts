import { MapSpec } from '../gen-schema/map-spec.schema';
import { Debug } from './core/Debug';
import { GameDriver } from './core/GameDriver';
import { GameEngine } from './core/GameEngine';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import MapFactory from './maps/MapFactory';
import { MapSupplier } from './maps/MapSupplier';
import UnitFactory from './units/UnitFactory';

const getInitialState = async (): Promise<GameState> => {
  const playerUnit = await UnitFactory.createPlayerUnit();

  const mapSpecs = (await import(
    /* webpackChunkName: "models" */
    `../../data/maps.json`
    )).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(mapSpec => {
    return () => MapFactory.loadMap(mapSpec);
  });
  return new GameState({ playerUnit, maps });
};

const main = async () => {
  const state = await getInitialState();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state
  });
  const gameDriver = new GameDriver({ renderer, state });
  const engine = gameDriver.getEngine();
  GameDriver.setInstance(gameDriver);
  GameState.setInstance(state);
  GameEngine.setInstance(engine);
  const debug = new Debug({ engine, state });
  debug.attachToWindow();
  await engine.render();
  await engine.preloadFirstMap();
};

main().then(() => {});
