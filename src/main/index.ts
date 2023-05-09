import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';
import InputHandler from './input/InputHandler';
import { addInitialState } from './actions/addInitialState';

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
  await addInitialState({ state, imageFactory });
  const inputHandler = new InputHandler();
  inputHandler.addEventListener(renderer.getCanvas());
  const debug = new Debug({ state, renderer });
  debug.attachToWindow();
  await renderer.render();
};

main().catch(e => {
  console.error(e);
  alert(e)
});
