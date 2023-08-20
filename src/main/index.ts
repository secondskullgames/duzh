import { Debug } from './core/Debug';
import Game from './core/Game';
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
  const game = new Game();
  const imageFactory = new ImageFactory();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const ticker = new Ticker();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    textRenderer
  });
  const mapFactory = new MapFactory();
  const inputHandler = new InputHandler({ getGame: () => game, imageFactory, mapFactory, ticker });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ game, imageFactory, mapFactory, ticker });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await showSplashScreen({ game });
  setInterval(async () => {
    await renderer.render({ game, imageFactory, ticker });
  }, 20);
};

main().catch(e => {
  console.error(e);
  alert(e);
});