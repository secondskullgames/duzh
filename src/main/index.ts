import type MapSpec from './schemas/MapSpec';
import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import MapFactory from './maps/MapFactory';
import { MapSupplier } from './maps/MapSupplier';
import UnitFactory from './entities/units/UnitFactory';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';
import InputHandler from './input/InputHandler';

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
  await addInitialState(state);
  const inputHandler = new InputHandler({
    state,
  });
  inputHandler.addEventListener((renderer as GameRenderer).getCanvas());
  const debug = new Debug({ state, renderer });
  debug.attachToWindow();
  await GameRenderer.getInstance().render();
};

const addInitialState = async (state: GameState) => {
  const playerUnit = await UnitFactory.createPlayerUnit({
    state,
    renderer: GameRenderer.getInstance(),
    imageFactory: ImageFactory.getInstance()
  });
  state.setPlayerUnit(playerUnit);

  const mapSpecs = (await import(
    /* webpackChunkName: "models" */
    `../../data/maps.json`
    )).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(spec => {
    return () => MapFactory.loadMap(spec, {
      state,
      imageFactory: ImageFactory.getInstance()
    });
  });
  state.addMaps(maps);
};

main().catch(e => {
  console.error(e);
  alert(e)
});
