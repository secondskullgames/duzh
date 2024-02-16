import 'reflect-metadata';
import { Debug } from './core/Debug';
import { GameState, GameStateImpl } from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { FontBundle, FontFactory } from './graphics/Fonts';
import { Feature } from './utils/features';
import { Session } from './core/Session';
import MapFactory from './maps/MapFactory';
import MapSpec from './schemas/MapSpec';
import { ImageCache, ImageCacheImpl } from './graphics/images/ImageCache';
import { createCanvas } from './utils/dom';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './graphics/constants';
import { checkNotNull } from './utils/preconditions';
import { Graphics } from './graphics/Graphics';
import { MapController, MapControllerImpl } from './maps/MapController';
import { AssetLoader, AssetLoaderImpl } from './assets/AssetLoader';
import { Container } from 'inversify';

const setupContainer = () => {
  const container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: true
  });
  container.bind(ImageCache.SYMBOL).to(ImageCacheImpl);
  container.bind<FontBundle>(FontBundle.SYMBOL).toDynamicValue(async context => {
    const fontFactory = context.container.get(FontFactory);
    return fontFactory.loadFonts();
  });
  container
    .bind(GameRenderer.PARENT_ELEMENT_SYMBOL)
    .toConstantValue(document.getElementById('container')!);
  container.bind(Session.SYMBOL).toDynamicValue(() => Session.create());
  container
    .bind(GameState.SYMBOL_MAP_SPECS)
    .toDynamicValue(async () =>
      container.get<AssetLoader>(AssetLoader).loadDataAsset<MapSpec[]>('maps.json')
    );
  container.bind(GameState.SYMBOL).to(GameStateImpl);
  container.bind(MapController.SYMBOL).to(MapControllerImpl);
  container.bind(AssetLoader).to(AssetLoaderImpl);
  return container;
};

const main = async () => {
  const container = setupContainer();

  const mapFactory = container.get(MapFactory);
  const mapSpecs = await container.getAsync<MapSpec[]>(GameState.SYMBOL_MAP_SPECS);
  const state = await container.getAsync<GameState>(GameState.SYMBOL);
  const maps = await mapFactory.loadMapSuppliers(mapSpecs, state);
  state.addMaps(maps);
  const session = await container.getAsync<Session>(Session.SYMBOL);

  const rootElement = checkNotNull(document.getElementById('container'));
  const canvas = createCanvas({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  rootElement.appendChild(canvas);
  canvas.tabIndex = 0;
  canvas.focus();
  const canvasGraphics = Graphics.forCanvas(canvas);

  const renderer = await container.getAsync(GameRenderer);
  const inputHandler = container.get(InputHandler);
  inputHandler.addEventListener(canvas);
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = container.get(Debug);
    debug.attachToWindow();
    document.getElementById('debug')?.classList.remove('production');
  }
  await showSplashScreen(state, session);
  setInterval(async () => {
    await renderer.render(canvasGraphics);
  }, 20);
};

main().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line no-alert
  alert(e);
});
