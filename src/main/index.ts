import 'reflect-metadata';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { Feature } from './utils/features';
import MapFactory from './maps/MapFactory';
import MapSpec from './schemas/MapSpec';
import { createCanvas } from './utils/dom';
import { checkNotNull } from './utils/preconditions';
import { MapController, MapControllerImpl } from './maps/MapController';
import { AssetLoader, AssetLoaderImpl } from './assets/AssetLoader';
import { Session, GameState, GameStateImpl, Debug } from '@main/core';
import { GameRenderer } from '@main/graphics/renderers';
import {
  Graphics,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  FontBundle,
  FontFactory
} from '@main/graphics';
import { Container } from 'inversify';

const setupContainer = async (): Promise<Container> => {
  const container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: true
  });
  container.bind<FontBundle>(FontBundle).toDynamicValue(async context => {
    const fontFactory = context.container.get(FontFactory);
    return fontFactory.loadFonts();
  });
  container.bind(Session.SYMBOL).toConstantValue(Session.create());
  container.bind(AssetLoader).to(AssetLoaderImpl);
  container
    .bind(GameState.SYMBOL_MAP_SPECS)
    .toConstantValue(
      await container.get<AssetLoader>(AssetLoader).loadDataAsset<MapSpec[]>('maps.json')
    );
  container.bind(GameState.SYMBOL).to(GameStateImpl);
  container.bind(MapController.SYMBOL).to(MapControllerImpl);
  return container;
};

const main = async () => {
  const container = await setupContainer();
  const mapFactory = container.get(MapFactory);
  const mapSpecs = await container.getAsync<MapSpec[]>(GameState.SYMBOL_MAP_SPECS);
  const state = await container.getAsync<GameState>(GameState.SYMBOL);
  const maps = await mapFactory.loadMapSuppliers(mapSpecs);
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
