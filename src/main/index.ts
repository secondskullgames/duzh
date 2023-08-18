import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import ImageFactory from './graphics/images/ImageFactory';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { loadFonts } from './graphics/Fonts';
import { Feature } from './utils/features';
import Ticker from './core/Ticker';
import MapFactory from './maps/MapFactory';
import { addInitialState } from './actions/addInitialState';

const main = async () => {
  const state = new GameState();
  const imageFactory = new ImageFactory();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const ticker = new Ticker();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state,
    imageFactory,
    textRenderer,
    ticker
  });
  const mapFactory = new MapFactory();
  const inputHandler = new InputHandler({ state, imageFactory, mapFactory, ticker });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ state, imageFactory, ticker });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await addInitialState({ state, imageFactory, mapFactory, ticker });
  await showSplashScreen({ state });
  setInterval(async () => {
    await renderer.render({ state, imageFactory });
  }, 20);
};

main().catch(e => {
  console.error(e);
  alert(e);
});