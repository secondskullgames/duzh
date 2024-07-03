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
import { enterFullScreen, isMobileDevice } from '@lib/utils/dom';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameConfig } from '@main/core/GameConfig';
import mapSpecsJson from '@data/maps.json';
import { Engine, EngineImpl } from '@main/core/Engine';
import { FontBundle } from '@lib/graphics/Fonts';
import ScreenHandlers from '@main/input/screens/ScreenHandlers';
import { createInputHandler } from '@main/input/createInputHandler';
import { createKonvaContext } from '@lib/utils/konva';
import { Container } from 'inversify';

type Props = Readonly<{
  rootElement: HTMLDivElement;
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
  const konvaContext = createKonvaContext({
    parentElement: rootElement,
    width: gameConfig.screenWidth,
    height: gameConfig.screenHeight
  });
  konvaContext.canvasLayer.draw();
  konvaContext.stage.draw();
  const renderer = await container.getAsync(GameRenderer);
  const inputHandler = await container.getAsync(InputHandler);
  inputHandler.addEventListener(document.body);

  if (isMobileDevice()) {
    await enterFullScreen();
  }
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = container.get(Debug);
    debug.attachToWindow();
  } else {
    document.getElementById('debug')?.remove();
  }
  await showSplashScreen(state, session);
  setInterval(async () => {
    await renderer.render(konvaContext.canvasGraphics);
    //const ctx = konvaContext.canvasGraphics;
    //ctx.fill(Colors.RED);
    konvaContext.canvasLayer.draw();
    konvaContext.stage.draw();
  }, 20);
};

const main = async () => {
  const rootElement = checkNotNull(
    document.getElementById('container') as HTMLDivElement
  );
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
