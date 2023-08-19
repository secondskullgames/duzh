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
import SpriteFactory from './graphics/sprites/SpriteFactory';
import AnimationFactory from './graphics/animations/AnimationFactory';
import ItemFactory from './items/ItemFactory';
import UnitFactory from './entities/units/UnitFactory';
import TileFactory from './tiles/TileFactory';
import ObjectFactory from './entities/objects/ObjectFactory';
import { checkNotNull } from './utils/preconditions';

const main = async () => {
  const state = new GameState();
  const imageFactory = new ImageFactory();
  const spriteFactory = new SpriteFactory({ imageFactory });
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ imageFactory, fonts });
  const ticker = new Ticker();
  const renderer = new GameRenderer({
    parent: document.getElementById('container')!,
    textRenderer
  });
  
  // avoiding cyclic dependencies...
  let _objectFactory: ObjectFactory | null = null;
  const getObjectFactory = (): ObjectFactory => checkNotNull(_objectFactory);
  
  const itemFactory = new ItemFactory({ spriteFactory, getObjectFactory });
  const unitFactory = new UnitFactory({ spriteFactory, itemFactory });
  const objectFactory = new ObjectFactory({ spriteFactory, unitFactory });
  _objectFactory = objectFactory;
  const tileFactory = new TileFactory({ spriteFactory });
  const mapFactory = new MapFactory({
    imageFactory,
    unitFactory,
    itemFactory,
    spriteFactory,
    tileFactory,
    objectFactory
  });
  const animationFactory = new AnimationFactory({ spriteFactory });
  const inputHandler = new InputHandler({
    state,
    imageFactory,
    spriteFactory,
    mapFactory,
    animationFactory,
    itemFactory,
    unitFactory,
    ticker,
    objectFactory
  });
  inputHandler.addEventListener(renderer.getCanvas());
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = new Debug({
      state,
      imageFactory,
      spriteFactory,
      mapFactory,
      itemFactory,
      objectFactory,
      ticker
    });
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await showSplashScreen({ state });
  setInterval(async () => {
    await renderer.render({ state, imageFactory, ticker });
  }, 20);
};

main().catch(e => {
  console.error(e);
  alert(e);
});