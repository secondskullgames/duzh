import { Debug } from './core/Debug';
import GameState from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
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
  const session = Session.create();
  const imageFactory = session.getImageFactory();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    imageFactory,
    textRenderer
  });
  const mapFactory = new MapFactory();
  const inputHandler = new InputHandler({
    state,
    session,
    mapFactory
  });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ state, session });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await addInitialState({ state, mapFactory, session });
  await showSplashScreen({ state, session });
  setInterval(async () => {
    await renderer.render(session);
  }, 20);
};

main().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line no-alert
  alert(e);
});
