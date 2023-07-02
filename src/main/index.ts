import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import ImageFactory from './graphics/images/ImageFactory';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { loadFonts } from './graphics/Fonts';
import { Feature } from './utils/features';

const main = async () => {
  const state = new GameState();
  const imageFactory = new ImageFactory();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state,
    imageFactory,
    textRenderer
  });
  const inputHandler = new InputHandler();
  inputHandler.addEventListener(renderer.getCanvas(), { state, renderer, imageFactory });
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ state, renderer, imageFactory });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await showSplashScreen({ state, renderer, imageFactory });
};

main().catch(e => {
  console.error(e);
  alert(e)
});