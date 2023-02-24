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
import SpriteFactory from './graphics/sprites/SpriteFactory';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';

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
  GameState.setInstance(state);
  const imageFactory = new ImageFactory();
  ImageFactory.setInstance(imageFactory);
  const fontRenderer = new FontRenderer({ imageFactory });
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state,
    imageFactory,
    fontRenderer
  });
  const engine = new GameEngine({ state, renderer });
  GameEngine.setInstance(engine);
  const gameDriver = new GameDriver({ renderer, state, engine });
  GameDriver.setInstance(gameDriver);
  const spriteFactory = new SpriteFactory({ imageFactory });
  SpriteFactory.setInstance(spriteFactory);
  const itemFactory = new ItemFactory({ state, engine, spriteFactory });
  ItemFactory.setInstance(itemFactory);
  const unitFactory = new UnitFactory({ itemFactory, spriteFactory });
  UnitFactory.setInstance(unitFactory);
  await addInitialState(state, unitFactory);
  const debug = new Debug({ engine, state });
  debug.attachToWindow();
  await engine.render();
  await engine.preloadFirstMap();
};

main().catch(e => {
  console.error(e);
  alert(e)
});
