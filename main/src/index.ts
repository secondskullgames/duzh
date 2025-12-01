import { MusicPlayer, SoundPlayer } from '@duzh/audio';
import { Feature } from '@duzh/features';
import { FontBundle, Graphics } from '@duzh/graphics';
import { ImageCache, ImageFactory, ImageLoader } from '@duzh/graphics/images';
import { GeneratedMapFactory, MapObjectFactory, PredefinedMapFactory } from '@duzh/maps';
import { AssetBundleSchema, ImageBundleSchema } from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';
import { InventoryController } from '@main/controllers/InventoryController';
import { ShrineController } from '@main/controllers/ShrineController';
import { EngineImpl } from '@main/core/Engine';
import { Game } from '@main/core/Game';
import { GameConfig } from '@main/core/GameConfig';
import Ticker from '@main/core/Ticker';
import GameSceneViewportRenderer from '@main/graphics/renderers/GameScreenViewportRenderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';
import { ShrineMenuRenderer } from '@main/graphics/renderers/ShrineMenuRenderer';
import TopMenuRenderer from '@main/graphics/renderers/TopMenuRenderer';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { createInputHandler } from '@main/input/createInputHandler';
import InputHandler from '@main/input/InputHandler';
import { ItemFactory } from '@main/items/ItemFactory';
import ObjectFactory from '@main/objects/ObjectFactory';
import ProjectileFactory from '@main/objects/ProjectileFactory';
import { CharacterScene } from '@main/scenes/CharacterScene';
import { GameOverScene } from '@main/scenes/GameOverScene';
import { GameScene } from '@main/scenes/GameScene';
import { HelpScene } from '@main/scenes/HelpScene';
import { InventoryScene } from '@main/scenes/InventoryScene';
import { MapScene } from '@main/scenes/MapScene';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { TitleScene } from '@main/scenes/TitleScene';
import { VictoryScene } from '@main/scenes/VictoryScene';
import { MusicController } from '@main/sounds/MusicController';
import { SoundController } from '@main/sounds/SoundController';
import TileFactory from '@main/tiles/TileFactory';
import UnitFactory from '@main/units/UnitFactory';
import { createCanvas, enterFullScreen, isMobileDevice } from '@main/utils/dom';
import { GameController } from './controllers/GameController';
import { DebugController } from './core/DebugController';
import { GameStateImpl } from './core/GameState';
import { FontFactory } from './graphics/Fonts';
import { GameSceneRenderer } from './graphics/renderers/GameSceneRenderer';
import { MapControllerImpl } from './maps/MapController';
import { MapHydrator } from './maps/MapHydrator';
import { InventorySceneRenderer } from './graphics/renderers/InventorySceneRenderer';
import { TitleSceneRenderer } from './graphics/renderers/TitleSceneRenderer';
import { VictorySceneRenderer } from './graphics/renderers/VictorySceneRenderer';

type Props = Readonly<{
  rootElement: HTMLElement;
  gameConfig: GameConfig;
}>;

/**
 * This is just a ball-of-mud to replace the huge pile of injected dependencies.
 * Not trying to clean it up yet.
 */
type GameContainer = Readonly<{
  gameConfig: GameConfig;
  fontBundle: FontBundle;
  game: Game;
  inputHandler: InputHandler;
  debugController: DebugController;
  scenes: Record<SceneName, Scene>;
  gameController: GameController;
}>;

const setupContainer = async ({ gameConfig }: Props): Promise<GameContainer> => {
  const { assetBundle, imageBundle } = gameConfig;
  const imageLoader = new ImageLoader(imageBundle);
  const imageFactory = new ImageFactory(imageLoader, new ImageCache());
  const fontFactory = new FontFactory(imageFactory);
  const fontBundle = await fontFactory.loadFonts();
  const textRenderer = new TextRenderer(gameConfig, fontBundle);
  const soundPlayer = SoundPlayer.forSounds();
  const soundController = new SoundController(assetBundle, soundPlayer);
  const musicPlayer = new MusicPlayer(SoundPlayer.forMusic());
  const musicController = new MusicController(assetBundle, musicPlayer);

  const spriteFactory = new SpriteFactory(assetBundle, imageFactory);
  const tileFactory = new TileFactory(assetBundle, spriteFactory);
  const itemFactory = new ItemFactory(assetBundle, spriteFactory);
  const unitFactory = new UnitFactory(assetBundle, spriteFactory, itemFactory);
  const objectFactory = new ObjectFactory(assetBundle, spriteFactory, unitFactory);
  const projectileFactory = new ProjectileFactory(spriteFactory);
  const predefinedMapFactory = new PredefinedMapFactory(imageFactory, assetBundle);
  const mapObjectFactory = new MapObjectFactory({ assetBundle });
  const generatedMapFactory = new GeneratedMapFactory({ assetBundle, mapObjectFactory });
  const mapHydrator = new MapHydrator(
    tileFactory,
    objectFactory,
    unitFactory,
    itemFactory
  );
  const mapController = new MapControllerImpl({
    assetBundle,
    predefinedMapFactory,
    generatedMapFactory,
    mapHydrator,
    unitFactory,
    musicPlayer
  });
  const inventoryController = new InventoryController();
  const shrineController = new ShrineController();
  const state = new GameStateImpl();
  const engine = new EngineImpl();
  const game: Game = {
    engine,
    state,
    config: gameConfig,
    assetBundle,
    itemFactory,
    unitFactory,
    objectFactory,
    projectileFactory,
    soundController,
    musicController,
    mapController,
    inventoryController,
    shrineController,
    mapObjectFactory,
    ticker: new Ticker()
  };
  const inputHandler = createInputHandler({ game });
  const debugController = new DebugController(game, mapController, itemFactory);

  const characterScene = new CharacterScene(game, textRenderer, imageFactory);
  const shrineMenuRenderer = new ShrineMenuRenderer(game, textRenderer, imageFactory);
  const viewportRenderer = new GameSceneViewportRenderer(
    game,
    imageFactory,
    shrineMenuRenderer
  );
  const hudRenderer = new HUDRenderer(game, textRenderer, imageFactory);
  const topMenuRenderer = new TopMenuRenderer(imageFactory);
  const gameController = new GameController({
    mapController,
    soundController,
    musicController
  });
  const gameSceneRenderer = new GameSceneRenderer(
    game,
    textRenderer,
    viewportRenderer,
    hudRenderer,
    topMenuRenderer
  );
  const gameScene = new GameScene(game, gameController, gameSceneRenderer);
  const gameOverScene = new GameOverScene(
    game,
    gameController,
    imageFactory,
    textRenderer
  );
  const helpScene = new HelpScene(game, textRenderer, imageFactory);
  const inventorySceneRenderer = new InventorySceneRenderer({
    game,
    imageFactory,
    textRenderer
  });
  const inventoryScene = new InventoryScene(game, inventorySceneRenderer);
  const mapScene = new MapScene(game);
  const titleSceneRenderer = new TitleSceneRenderer(imageFactory, textRenderer);
  const titleScene = new TitleScene(game, gameController, titleSceneRenderer);
  const victorySceneRenderer = new VictorySceneRenderer(game, textRenderer, imageFactory);
  const victoryScene = new VictoryScene(game, gameController, victorySceneRenderer);

  const scenes = {
    [SceneName.CHARACTER]: characterScene,
    [SceneName.GAME]: gameScene,
    [SceneName.GAME_OVER]: gameOverScene,
    [SceneName.HELP]: helpScene,
    [SceneName.INVENTORY]: inventoryScene,
    [SceneName.MAP]: mapScene,
    [SceneName.TITLE]: titleScene,
    [SceneName.VICTORY]: victoryScene
  };

  return {
    gameConfig,
    fontBundle,
    game,
    debugController,
    inputHandler,
    scenes,
    gameController
  };
};

const init = async ({ rootElement, gameConfig }: Props) => {
  const container = await setupContainer({ rootElement, gameConfig });
  const { game, inputHandler, scenes, gameController } = container;
  const canvas = createCanvas({
    width: gameConfig.screenWidth,
    height: gameConfig.screenHeight
  });
  rootElement.appendChild(canvas);
  canvas.tabIndex = 0;
  canvas.focus();
  const canvasGraphics = Graphics.forCanvas(canvas);
  let bufferGraphics: Graphics;
  if (Feature.isEnabled(Feature.DOUBLE_BUFFERING)) {
    const bufferCanvas = createCanvas({
      width: gameConfig.screenWidth,
      height: gameConfig.screenHeight
    });
    bufferGraphics = Graphics.forCanvas(bufferCanvas);
  }

  if (isMobileDevice()) {
    await enterFullScreen();
  }
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const debug = container.debugController;
    debug.attachToWindow();
  }

  const { state } = game;
  for (const scene of Object.values(scenes)) {
    state.addScene(scene);
  }

  inputHandler.addEventListener(canvas);

  await gameController.showTitleScene(game);
  setInterval(async () => {
    const currentScene = state.getCurrentScene();
    if (currentScene) {
      if (Feature.isEnabled(Feature.DOUBLE_BUFFERING)) {
        await currentScene.render(bufferGraphics);
        canvasGraphics.putImageData(bufferGraphics.getImageData(), { x: 0, y: 0 });
      } else {
        await currentScene.render(canvasGraphics);
      }
    }
  }, 20);
};

const main = async () => {
  const rootElement = checkNotNull(document.getElementById('container'));
  const assetBundle = AssetBundleSchema.parse(
    (await import('@duzh/assets/assets.json')).default
  );
  const imageBundle = ImageBundleSchema.parse(
    (await import('@duzh/assets/images.json')).default
  );
  const gameConfig: GameConfig = {
    assetBundle,
    imageBundle,
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
