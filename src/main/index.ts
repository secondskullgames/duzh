import 'reflect-metadata';
import { Debug } from './core/Debug';
import { GameState, GameStateImpl } from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import InputHandler from './input/InputHandler';
import { showSplashScreen } from './actions/showSplashScreen';
import { FontBundle, FontFactory } from './graphics/Fonts';
import { Feature } from './utils/features';
import { Session, SessionImpl } from './core/Session';
import MapFactory from './maps/MapFactory';
import MapSpec from './schemas/MapSpec';
import { createCanvas } from './utils/dom';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './graphics/constants';
import { checkNotNull } from './utils/preconditions';
import { Graphics } from './graphics/Graphics';
import { MapController, MapControllerImpl } from './maps/MapController';
import { AssetLoader, AssetLoaderImpl } from './assets/AssetLoader';
import { GameConfig } from '@main/core/GameConfig';
import * as mapSpecsJson from '@data/maps.json';
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
  container.bind(Session).to(SessionImpl);
  container.bind(AssetLoader).to(AssetLoaderImpl);

  const gameConfig: GameConfig = {
    mapSpecs: mapSpecsJson as MapSpec[]
  };
  container.bind(GameConfig).toConstantValue(gameConfig);
  container.bind(GameState).to(GameStateImpl);
  container.bind(MapController).to(MapControllerImpl);
  return container;
};

type Props = Readonly<{
  rootElement: HTMLElement;
  gameConfig: GameConfig;
}>;

const init = async ({ rootElement, gameConfig }: Props) => {
  const container = await setupContainer();
  const mapFactory = container.get(MapFactory);
  const state = await container.getAsync<GameState>(GameState);
  const maps = await mapFactory.loadMapSuppliers(gameConfig.mapSpecs);
  state.addMaps(maps);
  const session = await container.getAsync<Session>(Session);
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

const main = async () => {
  const rootElement = checkNotNull(document.getElementById('container'));
  const gameConfig: GameConfig = {
    mapSpecs: mapSpecsJson as MapSpec[]
  };

  await init({ rootElement, gameConfig });
};

main().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line no-alert
  alert(e);
});
