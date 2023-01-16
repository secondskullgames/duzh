import { MapSpec } from '../gen-schema/map-spec.schema';
import { initialize } from './core/actions';
import { Debug } from './core/debug';
import { GameDriver } from './core/GameDriver';
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
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!
  });
  const state = await getInitialState();
  const gameDriver = new GameDriver({ renderer, state });
  GameDriver.setInstance(gameDriver);
  const engine = await initialize(state, renderer, gameDriver);
  const debug = new Debug({ engine, state });
  debug.attachToWindow();
};

main().then(() => {});
