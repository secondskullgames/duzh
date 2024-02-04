import { Debug } from './core/Debug';
import { GameState } from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { loadFonts } from './graphics/Fonts';
import { Feature } from './utils/features';
import { addInitialState } from './actions/addInitialState';
import { Session } from './core/Session';
import MapFactory from './maps/MapFactory';
import ImageFactory from './graphics/images/ImageFactory';
import AnimationFactory from './graphics/animations/AnimationFactory';
import TileFactory from './tiles/TileFactory';
import SpriteFactory from './graphics/sprites/SpriteFactory';

const main = async () => {
  const imageFactory = new ImageFactory();
  const spriteFactory = new SpriteFactory({ imageFactory });
  const tileFactory = new TileFactory({ imageFactory, spriteFactory });
  const mapFactory = new MapFactory({
    imageFactory,
    tileFactory,
    spriteFactory
  });
  const animationFactory = new AnimationFactory({ imageFactory, spriteFactory });
  const state = GameState.create({
    imageFactory,
    mapFactory,
    animationFactory,
    spriteFactory,
    tileFactory
  });
  const session = Session.create();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    imageFactory,
    textRenderer
  });
  const inputHandler = new InputHandler({
    state,
    session
  });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({ state, session });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await addInitialState(state, session);
  await showSplashScreen(session);
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
