import 'reflect-metadata';
import { Debug } from './core/Debug';
import { GameState, GameStateImpl } from './core/GameState';
import GameRenderer from './graphics/renderers/GameRenderer';
import { showSplashScreen } from './actions/showSplashScreen';
import { FontFactory } from './graphics/Fonts';
import { Feature } from './utils/features';
import { Session, SessionImpl } from './core/Session';
import { MapController, MapControllerImpl } from './maps/MapController';
import { MapSpec } from '@models/MapSpec';
import InputHandler from '@lib/input/InputHandler';
import { AssetLoader, AssetLoaderImpl } from '@lib/assets/AssetLoader';
import { createCanvas } from '@lib/utils/dom';
import { checkNotNull } from '@lib/utils/preconditions';
import { Graphics } from '@lib/graphics/Graphics';
import { GameConfig } from '@main/core/GameConfig';
import mapSpecsJson from '@data/maps.json';
import { Engine, EngineImpl } from '@main/core/Engine';
import { FontBundle } from '@lib/graphics/Fonts';
import ScreenHandlers from '@main/input/screens/ScreenHandlers';
import { createInputHandler } from '@main/input/createInputHandler';
import { Container } from 'inversify';

type Props = Readonly<{
  rootElement: HTMLElement;
  gameConfig: GameConfig;
}>;

const setupContainer = async ({ gameConfig }: Props): Promise<Container> => {
  const container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: true
  });
  container.bind(GameConfig).toConstantValue(gameConfig);
  container.bind<FontBundle>(FontBundle).toDynamicValue(async context => {
    const fontFactory = context.container.get(FontFactory);
    return fontFactory.loadFonts();
  });
  container.bind(Session).to(SessionImpl);
  container.bind(AssetLoader).to(AssetLoaderImpl);
  container.bind(GameState).to(GameStateImpl);
  container.bind(MapController).to(MapControllerImpl);
  container.bind(InputHandler).toDynamicValue(async context => {
    const screenHandlers = context.container.get(ScreenHandlers);
    const session = context.container.get<Session>(Session);
    return createInputHandler({ session, screenHandlers });
  });
  container.bind(Engine).to(EngineImpl);
  return container;
};

const init = async ({ rootElement, gameConfig }: Props) => {
  const container = await setupContainer({ rootElement, gameConfig });
  const state = await container.getAsync<GameState>(GameState);
  const session = await container.getAsync<Session>(Session);
  const canvas = createCanvas({
    width: gameConfig.screenWidth,
    height: gameConfig.screenHeight
  });
  rootElement.appendChild(canvas);
  canvas.tabIndex = 0;
  canvas.focus();
  const canvasGraphics = Graphics.forCanvas(canvas);

  const renderer = await container.getAsync(GameRenderer);
  const inputHandler = await container.getAsync(InputHandler);
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
    mapSpecs: mapSpecsJson as MapSpec[],
    screenWidth: 640,
    screenHeight: 360
  };

  await init({ rootElement, gameConfig });
};

main().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line no-alert
  alert(e);
});
