import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import ImageFactory from './graphics/images/ImageFactory';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { loadFonts } from './graphics/Fonts';
import { Feature } from './utils/features';
import MapFactory from './maps/MapFactory';
import { addInitialState } from './actions/addInitialState';
import { Session } from './core/Session';

const main = async () => {
  const state = new GameState();
  const imageFactory = new ImageFactory();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const session = new Session();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    state,
    session,
    imageFactory,
    textRenderer
  });
  const mapFactory = new MapFactory();
  const inputHandler = new InputHandler({
    state,
    session,
    imageFactory,
    mapFactory
  });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ state, imageFactory, session });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await addInitialState({ state, imageFactory, mapFactory, session });
  await showSplashScreen({ state });
  setInterval(async () => {
    await renderer.render({ state, session, imageFactory });
  }, 20);
};

main().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line no-alert
  alert(e);
});
