import 'reflect-metadata';
import { Debug } from './core/Debug';
import { GameState, GameStateImpl } from './core/GameState';
import { showSplashScreen } from './actions/showSplashScreen';
import { FontFactory } from './graphics/Fonts';
import { Feature } from './utils/features';
import { Session, SessionImpl } from './core/Session';
import { MapController, MapControllerImpl } from './maps/MapController';
import { MapSpec } from '@models/MapSpec';
import InputHandler from '@lib/input/InputHandler';
import { AssetLoader, AssetLoaderImpl } from '@lib/assets/AssetLoader';
import { createCanvas, enterFullScreen, isMobileDevice } from '@lib/utils/dom';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameConfig } from '@main/core/GameConfig';
import mapSpecsJson from '@data/maps.json';
import { Engine, EngineImpl } from '@main/core/Engine';
import { FontBundle } from '@lib/graphics/Fonts';
import ScreenHandlers from '@main/input/screens/ScreenHandlers';
import { createInputHandler } from '@main/input/createInputHandler';
import { Container } from '@lib/ui/Container';
import { Container as InversifyContainer } from 'inversify';

type Props = Readonly<{
  rootElement: HTMLElement;
  gameConfig: GameConfig;
}>;

const setupContainer = async ({
  rootElement,
  gameConfig
}: Props): Promise<InversifyContainer> => {
  const inversifyContainer = new InversifyContainer({
    defaultScope: 'Singleton',
    autoBindInjectable: true
  });
  inversifyContainer.bind(GameConfig).toConstantValue(gameConfig);
  inversifyContainer.bind<FontBundle>(FontBundle).toDynamicValue(async context => {
    const fontFactory = context.container.get(FontFactory);
    return fontFactory.loadFonts();
  });
  inversifyContainer.bind(Session).to(SessionImpl);
  inversifyContainer.bind(AssetLoader).to(AssetLoaderImpl);
  inversifyContainer.bind(GameState).to(GameStateImpl);
  inversifyContainer.bind(MapController).to(MapControllerImpl);
  inversifyContainer.bind(InputHandler).toDynamicValue(async context => {
    const screenHandlers = context.container.get(ScreenHandlers);
    const session = context.container.get<Session>(Session);
    return createInputHandler({ session, screenHandlers });
  });
  inversifyContainer.bind(Engine).to(EngineImpl);
  const canvas = createCanvas({
    width: gameConfig.screenWidth,
    height: gameConfig.screenHeight
  });
  rootElement.appendChild(canvas);
  canvas.tabIndex = 0;
  canvas.focus();
  const container = new Container({ canvas });
  inversifyContainer.bind(Container).toConstantValue(container);
  return inversifyContainer;
};

const init = async ({ rootElement, gameConfig }: Props) => {
  const inversifyContainer = await setupContainer({ rootElement, gameConfig });
  const state = await inversifyContainer.getAsync<GameState>(GameState);
  const session = await inversifyContainer.getAsync<Session>(Session);

  const inputHandler = await inversifyContainer.getAsync(InputHandler);
  const container = await inversifyContainer.getAsync(Container);
  inputHandler.addEventListener(container.canvas);

  if (isMobileDevice()) {
    await enterFullScreen();
  }
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = inversifyContainer.get(Debug);
    debug.attachToWindow();
  } else {
    document.getElementById('debug')?.remove();
  }
  await showSplashScreen(state, session);
  setInterval(async () => {
    await container.render();
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
