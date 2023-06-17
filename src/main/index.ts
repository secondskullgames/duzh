import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import ImageFactory from './graphics/images/ImageFactory';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { loadFonts } from './graphics/Fonts';

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
  if (!_isProduction()) {
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

const _isProduction = (): boolean => {
  return document.location.href === 'https://duzh.netlify.app';
};