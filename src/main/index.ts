import 'reflect-metadata';
import { Debug } from './core/Debug';
import { GameState, GameStateImpl } from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import { TextRenderer } from './graphics/TextRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { FontBundle, loadFonts } from './graphics/Fonts';
import { Feature } from './utils/features';
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
import ScreenHandlers from './input/screens/ScreenHandlers';
import TitleScreenInputHandler from './input/screens/TitleScreenInputHandler';
import GameOverScreenInputHandler from './input/screens/GameOverScreenInputHandler';
import VictoryScreenInputHandler from './input/screens/VictoryScreenInputHandler';
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
  container.bind<FontBundle>(FontBundle.SYMBOL).toDynamicValue(async context => {
    const imageFactory = context.container.get(ImageFactory);
    return loadFonts({ imageFactory });
  });
  container.bind(TextRenderer).toSelf();
  container
    .bind(GameRenderer.PARENT_ELEMENT_SYMBOL)
    .toConstantValue(document.getElementById('container')!);
  container.bind(GameRenderer).toSelf();
  container.bind(TitleScreenInputHandler).toSelf();
  container.bind(GameOverScreenInputHandler).toSelf();
  container.bind(VictoryScreenInputHandler).toSelf();
  container.bind(ScreenHandlers).toSelf();
  container.bind(Session.SYMBOL).toDynamicValue(() => Session.create());
  container.bind(GameState.SYMBOL_MAP_SPECS).toDynamicValue(async () => _loadMapSpecs());
  container.bind(GameState.SYMBOL).to(GameStateImpl);
  container.bind(InputHandler).toSelf();
  return container;
};

const main = async () => {
  const container = setupContainer();

  const mapFactory = container.get(MapFactory);
  const mapSpecs = await _loadMapSpecs();
  const state = await container.getAsync<GameState>(GameState.SYMBOL);
  const maps = await mapFactory.loadMapSuppliers(mapSpecs, state);
  state.addMaps(maps);
  const session = await container.getAsync<Session>(Session.SYMBOL);
  const renderer = await container.getAsync(GameRenderer);
  const inputHandler = container.get(InputHandler);
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
