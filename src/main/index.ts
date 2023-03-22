import type MapSpec from './schemas/MapSpec';
import { Debug } from './core/Debug';
import { GameDriver } from './core/GameDriver';
import { GameEngine } from './core/GameEngine';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import MapFactory from './maps/MapFactory';
import { MapSupplier } from './maps/MapSupplier';
import UnitFactory from './entities/units/UnitFactory';
import ItemFactory from './items/ItemFactory';
import SpriteFactory from './graphics/sprites/SpriteFactory';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';
import AnimationFactory from './graphics/animations/AnimationFactory';
import ProjectileFactory from './entities/objects/ProjectileFactory';
import InputHandler from './input/InputHandler';
import SpawnerFactory from './entities/objects/SpawnerFactory';
import TileFactory from './tiles/TileFactory';

const addInitialState = async (state: GameState, unitFactory: UnitFactory, mapFactory: MapFactory) => {
  const playerUnit = await unitFactory.createPlayerUnit();
  state.setPlayerUnit(playerUnit);

  const mapSpecs = (await import(
    /* webpackChunkName: "models" */
    `../../data/maps.json`
    )).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(spec => () => mapFactory.loadMap(spec));
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
  const projectileFactory = new ProjectileFactory({ spriteFactory });
  const animationFactory = new AnimationFactory({ state, projectileFactory });
  AnimationFactory.setInstance(animationFactory);
  const itemFactory = new ItemFactory({ state, engine, spriteFactory, animationFactory });
  ItemFactory.setInstance(itemFactory);
  const unitFactory = new UnitFactory({ itemFactory, spriteFactory });
  UnitFactory.setInstance(unitFactory);
  const spawnerFactory = new SpawnerFactory({ spriteFactory, unitFactory, state });
  const tileFactory = new TileFactory({ spriteFactory });
  const mapFactory = new MapFactory({
    state,
    imageFactory,
    itemFactory,
    spawnerFactory,
    spriteFactory,
    tileFactory,
    unitFactory
  });
  await addInitialState(state, unitFactory, mapFactory);
  const inputHandler = new InputHandler({ mapFactory, state, engine, driver: gameDriver });
  inputHandler.addEventListener((renderer as GameRenderer).getCanvas());
  const debug = new Debug({ engine, state });
  debug.attachToWindow();
  await engine.render();
  await engine.preloadFirstMap();
};

main().catch(e => {
  console.error(e);
  alert(e)
});
