import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import ImageFactory from './graphics/images/ImageFactory';
import { FontRenderer } from './graphics/FontRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';

const main = async () => {
  const state = new GameState();
  const imageFactory = new ImageFactory();
  const fontRenderer = new FontRenderer({ imageFactory });
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state,
    imageFactory,
    fontRenderer
  });
  const inputHandler = new InputHandler();
  inputHandler.addEventListener(renderer.getCanvas(), { state, renderer, imageFactory });
  const debug = new Debug({ state, renderer, imageFactory });
  debug.attachToWindow();
  await showSplashScreen({ state, renderer, imageFactory });
};

main().catch(e => {
  console.error(e);
  alert(e)
});
