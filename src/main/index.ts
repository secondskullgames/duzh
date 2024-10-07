import 'reflect-metadata';
import { DebugController } from './core/DebugController';
import { GameStateImpl } from './core/GameState';
import { showTitleScreen } from './actions/showTitleScreen';
import { FontFactory } from './graphics/Fonts';
import { Feature } from './utils/features';
import { SessionImpl } from './core/Session';
import { MapController, MapControllerImpl } from './maps/MapController';
import { MapSpec } from '@models/MapSpec';
import InputHandler from '@lib/input/InputHandler';
import { AssetLoader, AssetLoaderImpl } from '@lib/assets/AssetLoader';
import { createCanvas, enterFullScreen, isMobileDevice } from '@lib/utils/dom';
import { checkNotNull } from '@lib/utils/preconditions';
import { Graphics } from '@lib/graphics/Graphics';
import { GameConfig } from '@main/core/GameConfig';
import mapSpecsJson from '@data/maps.json';
import { EngineImpl } from '@main/core/Engine';
import { FontBundle } from '@lib/graphics/Fonts';
import { createInputHandler } from '@main/input/createInputHandler';
import { TitleScene } from '@main/scenes/TitleScene';
import { GameScene } from '@main/scenes/GameScene';
import { InventoryScene } from '@main/scenes/InventoryScene';
import { CharacterScene } from '@main/scenes/CharacterScene';
import { VictoryScene } from '@main/scenes/VictoryScene';
import { HelpScene } from '@main/scenes/HelpScene';
import { GameOverScene } from '@main/scenes/GameOverScene';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { MapScene } from '@main/scenes/MapScene';
import { OrderExecutor } from '@main/units/orders/OrderExecutor';
import SoundPlayer from '@lib/audio/SoundPlayer';
import { Container } from 'inversify';
import { Game } from '@main/core/Game';

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
  container.bind(AssetLoader).to(AssetLoaderImpl);
  container.bind(MapController).to(MapControllerImpl);
  container.bind(SoundPlayer).toConstantValue(SoundPlayer.forSounds());
  const session = new SessionImpl();
  const state = await container.getAsync(GameStateImpl);
  const orderExecutor = await container.getAsync(OrderExecutor);
  const engine = new EngineImpl(orderExecutor);
  const game: Game = {
    engine,
    state,
    session,
    config: gameConfig
  };
  container.bind(Game).toConstantValue(game);
  const inputHandler = createInputHandler({ game });
  container.bind(InputHandler).toConstantValue(inputHandler);
  return container;
};

const init = async ({ rootElement, gameConfig }: Props) => {
  const container = await setupContainer({ rootElement, gameConfig });
  const game = await container.getAsync<Game>(Game);
  const canvas = createCanvas({
    width: gameConfig.screenWidth,
    height: gameConfig.screenHeight
  });
  rootElement.appendChild(canvas);
  canvas.tabIndex = 0;
  canvas.focus();
  const canvasGraphics = Graphics.forCanvas(canvas);

  if (isMobileDevice()) {
    await enterFullScreen();
  }
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = container.get(DebugController);
    debug.attachToWindow();
    const debugElement = document.getElementById('debug');
    if (debugElement) {
      debugElement.style.display = 'block';
    }
  }

  const scenes: Record<SceneName, Scene> = {
    [SceneName.CHARACTER]: await container.getAsync(CharacterScene),
    [SceneName.GAME]: await container.getAsync(GameScene),
    [SceneName.GAME_OVER]: await container.getAsync(GameOverScene),
    [SceneName.HELP]: await container.getAsync(HelpScene),
    [SceneName.INVENTORY]: await container.getAsync(InventoryScene),
    [SceneName.MAP]: await container.getAsync(MapScene),
    [SceneName.TITLE]: await container.getAsync(TitleScene),
    [SceneName.VICTORY]: await container.getAsync(VictoryScene)
  };
  const { session } = game;
  for (const scene of Object.values(scenes)) {
    session.addScene(scene);
  }

  const inputHandler = await container.getAsync(InputHandler);
  inputHandler.addEventListener(canvas);

  await showTitleScreen(game);
  setInterval(async () => {
    const currentScene = session.getCurrentScene();
    if (currentScene) {
      await currentScene.render(canvasGraphics);
    }
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
  console.error(e);
  if (Feature.isEnabled(Feature.ALERT_ON_ERROR)) {
    // eslint-disable-next-line no-alert
    alert(e);
  }
});
