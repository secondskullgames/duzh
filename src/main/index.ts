import 'reflect-metadata';
import { DebugController } from './core/DebugController';
import { showTitleScreen } from './actions/showTitleScreen';
import { FontFactory } from './graphics/Fonts';
import { Feature } from './utils/features';
import { GameStateImpl } from './core/GameState';
import { MapController, MapControllerImpl } from './maps/MapController';
import { MapSpec } from '@models/MapSpec';
import InputHandler from '@lib/input/InputHandler';
import { AssetLoaderImpl } from '@lib/assets/AssetLoader';
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
import SoundPlayer from '@lib/audio/SoundPlayer';
import { Container } from 'inversify';
import { Game } from '@main/core/Game';
import UnitFactory from '@main/units/UnitFactory';
import { ItemFactory } from '@main/items/ItemFactory';
import ModelLoader from '@main/assets/ModelLoader';
import ProjectileFactory from '@main/objects/ProjectileFactory';
import MusicController from '@main/sounds/MusicController';
import ObjectFactory from '@main/objects/ObjectFactory';
import Ticker from '@main/core/Ticker';
import { InventoryController } from '@main/controllers/InventoryController';
import { ShrineController } from '@main/controllers/ShrineController';
import { UnitService } from '@main/controllers/UnitService';
import { ImageLoader } from '@lib/graphics/images/ImageLoader';
import { ImageFactory } from '@lib/graphics/images/ImageFactory';
import { ImageCache } from '@lib/graphics/images/ImageCache';
import { TextRenderer } from '@main/graphics/TextRenderer';
import GameScreenViewportRenderer from '@main/graphics/renderers/GameScreenViewportRenderer';
import TopMenuRenderer from '@main/graphics/renderers/TopMenuRenderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';
import { ShrineMenuRenderer } from '@main/graphics/renderers/ShrineMenuRenderer';

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
  const assetLoader = new AssetLoaderImpl();
  const modelLoader = new ModelLoader(assetLoader);
  const imageLoader = new ImageLoader(assetLoader);
  const imageFactory = new ImageFactory(imageLoader, new ImageCache());
  const fontFactory = new FontFactory(imageFactory);
  const fontBundle = await fontFactory.loadFonts();
  container.bind(ModelLoader).toConstantValue(modelLoader);
  container.bind(ImageFactory).toConstantValue(imageFactory);
  container.bind(FontBundle).toConstantValue(fontBundle);
  container.bind(MapController).to(MapControllerImpl);
  container.bind(SoundPlayer).toConstantValue(SoundPlayer.forSounds());
  container
    .bind(MusicController)
    .toConstantValue(new MusicController(assetLoader, SoundPlayer.forMusic()));
  return container;
};

const init = async ({ rootElement, gameConfig }: Props) => {
  const container = await setupContainer({ rootElement, gameConfig });
  const state = new GameStateImpl();
  const engine = new EngineImpl();
  const game: Game = {
    engine,
    state,
    config: gameConfig,
    imageFactory: await container.getAsync(ImageFactory),
    itemFactory: await container.getAsync(ItemFactory),
    unitFactory: await container.getAsync(UnitFactory),
    objectFactory: await container.getAsync(ObjectFactory),
    musicController: await container.getAsync(MusicController),
    projectileFactory: await container.getAsync(ProjectileFactory),
    modelLoader: await container.getAsync(ModelLoader),
    textRenderer: await container.getAsync(TextRenderer),
    soundPlayer: container.get(SoundPlayer),
    mapController: await container.getAsync(MapController),
    inventoryController: await container.getAsync(InventoryController),
    shrineController: await container.getAsync(ShrineController),
    unitService: await container.getAsync(UnitService),
    ticker: new Ticker()
  };
  const inputHandler = createInputHandler({ game });
  container.bind(InputHandler).toConstantValue(inputHandler);
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
    debug.attachToWindow(game);
  }

  const scenes: Record<SceneName, Scene> = {
    [SceneName.CHARACTER]: new CharacterScene(),
    [SceneName.GAME]: new GameScene(
      new GameScreenViewportRenderer(new ShrineMenuRenderer()),
      new HUDRenderer(),
      new TopMenuRenderer()
    ),
    [SceneName.GAME_OVER]: new GameOverScene(),
    [SceneName.HELP]: new HelpScene(),
    [SceneName.INVENTORY]: new InventoryScene(),
    [SceneName.MAP]: new MapScene(),
    [SceneName.TITLE]: new TitleScene(),
    [SceneName.VICTORY]: new VictoryScene()
  };
  for (const scene of Object.values(scenes)) {
    state.addScene(scene);
  }

  inputHandler.addEventListener(canvas);

  await showTitleScreen(game);
  setInterval(async () => {
    const currentScene = state.getCurrentScene();
    if (currentScene) {
      await currentScene.render(game, canvasGraphics);
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
