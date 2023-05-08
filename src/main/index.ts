import type MapSpec from './schemas/MapSpec';
import { Debug } from './core/Debug';
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
  const spriteFactory = new SpriteFactory({ imageFactory });
  SpriteFactory.setInstance(spriteFactory);
  const projectileFactory = new ProjectileFactory({ spriteFactory });
  const animationFactory = new AnimationFactory({ state, projectileFactory });
  AnimationFactory.setInstance(animationFactory);
  const itemService = new ItemService({ state, spriteFactory, animationFactory });
  ItemService.setInstance(itemService);
  const unitFactory = new UnitFactory({ itemService: itemService, spriteFactory });
  UnitFactory.setInstance(unitFactory);
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
    itemService
  });
  inputHandler.addEventListener((renderer as GameRenderer).getCanvas());
  const debug = new Debug({ state, renderer });
  debug.attachToWindow();
  await GameRenderer.getInstance().render();
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
