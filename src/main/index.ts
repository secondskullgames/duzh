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

const main = async () => {
  const state = new GameState();
  const fonts = await loadFonts();
  const textRenderer = new TextRenderer({ fonts });
  const ticker = new Ticker();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state,
    textRenderer,
    ticker
  });
  const mapFactory = new MapFactory();
  const inputHandler = new InputHandler({ state, mapFactory, ticker });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ state, mapFactory, ticker });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await showSplashScreen({ state });
  setInterval(async () => {
    await renderer.render({ state, });
  }, 20);
};

main().catch(e => {
  console.error(e);
  alert(e);
});