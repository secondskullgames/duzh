import type MapSpec from './schemas/MapSpec';
import { Debug } from './core/Debug';
import { GameDriver } from './core/GameDriver';
import { GameEngine } from './core/GameEngine';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import MapFactory from './maps/MapFactory';
import { MapSupplier } from './maps/MapSupplier';
import UnitFactory from './entities/units/UnitFactory';
import ItemService from './items/ItemService';
import SpriteFactory from './graphics/sprites/SpriteFactory';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';
import AnimationFactory from './graphics/animations/AnimationFactory';
import ProjectileFactory from './entities/objects/ProjectileFactory';
import InputHandler from './input/InputHandler';
import ObjectFactory from './entities/objects/ObjectFactory';
import TileFactory from './tiles/TileFactory';
import UnitService from './entities/units/UnitService';
import UnitActionsService from './entities/units/UnitActionsService';

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
  GameRenderer.setInstance(renderer);
  const engine = new GameEngine({ state, renderer });
  GameEngine.setInstance(engine);
  const gameDriver = new GameDriver({ state, engine });
  GameDriver.setInstance(gameDriver);
  const spriteFactory = new SpriteFactory({ imageFactory });
  SpriteFactory.setInstance(spriteFactory);
  const projectileFactory = new ProjectileFactory({ spriteFactory });
  const animationFactory = new AnimationFactory({ state, projectileFactory });
  AnimationFactory.setInstance(animationFactory);
  const itemService = new ItemService({ state, engine, spriteFactory, animationFactory });
  ItemService.setInstance(itemService);
  const unitFactory = new UnitFactory({ itemService: itemService, spriteFactory });
  UnitFactory.setInstance(unitFactory);
  const unitService = new UnitService({ state, engine, animationFactory });
  UnitService.setInstance(unitService);
  const unitActionsService = new UnitActionsService({ state, engine, unitService });
  UnitActionsService.setInstance(unitActionsService);
  const spawnerFactory = new ObjectFactory({ spriteFactory, unitFactory, state });
  const tileFactory = new TileFactory({ spriteFactory });
  const mapFactory = new MapFactory({
    state,
    imageFactory,
    itemService: itemService,
    spawnerFactory,
    spriteFactory,
    tileFactory,
    unitFactory
  });
  await addInitialState(state, unitFactory, mapFactory);
  const inputHandler = new InputHandler({
    mapFactory,
    state,
    engine,
    driver: gameDriver,
    itemService
  });
  inputHandler.addEventListener((renderer as GameRenderer).getCanvas());
  const debug = new Debug({ engine, state, renderer, unitService });
  debug.attachToWindow();
  await GameRenderer.getInstance().render();
  await engine.preloadFirstMap();
};

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

main().catch(e => {
  console.error(e);
  alert(e)
});
