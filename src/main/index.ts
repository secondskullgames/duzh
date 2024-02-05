import 'reflect-metadata';
import { Debug } from './core/Debug';
import { GameState } from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { loadFonts } from './graphics/Fonts';
import { Feature } from './utils/features';
import { loadGameMaps } from './actions/loadGameMaps';
import { Session } from './core/Session';
import MapFactory from './maps/MapFactory';
import ImageFactory from './graphics/images/ImageFactory';
import AnimationFactory from './graphics/animations/AnimationFactory';
import TileFactory from './tiles/TileFactory';
import SpriteFactory from './graphics/sprites/SpriteFactory';
import ItemFactory from './items/ItemFactory';
import UnitFactory from './entities/units/UnitFactory';
import ProjectileFactory from './entities/objects/ProjectileFactory';
import ObjectFactory from './entities/objects/ObjectFactory';
import MapSpec from './schemas/MapSpec';
import ImageLoader from './graphics/images/ImageLoader';
import { ImageCache, ImageCacheImpl } from './graphics/images/ImageCache';
import { PredefinedMapFactory } from './maps/predefined/PredefinedMapFactory';
import { Container } from 'inversify';

const _loadMapSpecs = async (): Promise<MapSpec[]> =>
  (
    await import(
      /* webpackChunkName: "models" */
      '../../data/maps.json'
    )
  ).default as MapSpec[];

const setupContainer = () => {
  const container = new Container({ defaultScope: 'Singleton' });
  container.bind(ImageCache.SYMBOL).to(ImageCacheImpl);
  container.bind(ImageLoader).toSelf();
  container.bind(ImageFactory).toSelf();
  container.bind(SpriteFactory).toSelf();
  container.bind(TileFactory).toSelf();
  container.bind(ItemFactory).toSelf();
  container.bind(UnitFactory).toSelf();
  container.bind(ObjectFactory).toSelf();
  container.bind(PredefinedMapFactory).toSelf();
  container.bind(MapFactory).toSelf();
  container.bind(ProjectileFactory).toSelf();
  container.bind(AnimationFactory).toSelf();
  return container;
};

const main = async () => {
  const container = setupContainer();

  const imageFactory = container.get(ImageFactory);
  const spriteFactory = container.get(SpriteFactory);
  const tileFactory = container.get(TileFactory);
  const itemFactory = container.get(ItemFactory);
  const unitFactory = container.get(UnitFactory);
  const objectFactory = container.get(ObjectFactory);
  const mapFactory = container.get(MapFactory);
  const projectileFactory = container.get(ProjectileFactory);
  const animationFactory = container.get(AnimationFactory);
  const mapSpecs = await _loadMapSpecs();
  const state = GameState.create({
    mapSpecs,
    imageFactory,
    mapFactory,
    animationFactory,
    spriteFactory,
    tileFactory,
    itemFactory,
    unitFactory,
    objectFactory,
    projectileFactory
  });
  const maps = await loadGameMaps(mapSpecs, state);
  state.addMaps(maps);
  const session = Session.create();
  const fonts = await loadFonts({ imageFactory });
  const textRenderer = new TextRenderer({ fonts });
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
