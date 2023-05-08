import type MapSpec from './schemas/MapSpec';
import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import MapFactory from './maps/MapFactory';
import { MapSupplier } from './maps/MapSupplier';
import UnitFactory from './entities/units/UnitFactory';
import ItemFactory from './items/ItemFactory';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';
import InputHandler from './input/InputHandler';
import ObjectFactory from './entities/objects/ObjectFactory';

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
  const itemFactory = new ItemFactory({ state });
  ItemFactory.setInstance(itemFactory);
  const unitFactory = new UnitFactory({ itemFactory });
  UnitFactory.setInstance(unitFactory);
  const objectFactory = new ObjectFactory({ unitFactory, state });
  const mapFactory = new MapFactory({
    state,
    imageFactory,
    itemFactory,
    objectFactory,
    unitFactory
  });
  await addInitialState(state, unitFactory, mapFactory);
  const inputHandler = new InputHandler({
    mapFactory,
    state,
    itemFactory
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
