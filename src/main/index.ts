import { initDebug } from './core/debug';
import GameRenderer from './graphics/renderers/GameRenderer';
import GameState from './core/GameState';
import UnitFactory from './units/UnitFactory';
import MapSpec from './maps/MapSpec';
import { MapSupplier } from './maps/MapSupplier';
import MapFactory from './maps/MapFactory';
import { initialize } from './core/actions';
import { GameDriver } from './core/GameDriver';

const renderer = new GameRenderer({
  parent: document.getElementById('container')!
});

const gameDriver: GameDriver = {
  initState: async (): Promise<GameState> => {
    const playerUnit = await UnitFactory.createPlayerUnit();

    const json = (await import(
      /* webpackChunkName: "models" */
      `../../data/maps.json`
      )).default as any[];
    const mapSpecs = json.map(item => MapSpec.parse(item));
    const maps: MapSupplier[] = mapSpecs.map(mapSpec => {
      return () => MapFactory.loadMap(mapSpec);
    });
    return new GameState({ playerUnit, maps });
  },
  getRenderer: () => renderer
};

const main = async () => {
  GameDriver.setInstance(gameDriver);
  const state = await gameDriver.initState();
  const renderer = gameDriver.getRenderer();
  await initialize(state, renderer);
  initDebug();
};

main().then(() => {});
