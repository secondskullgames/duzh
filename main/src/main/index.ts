import { MusicController, SoundPlayer } from '@duzh/audio';
import { checkNotNull } from '@duzh/utils/preconditions';
import { FontBundle } from '@lib/graphics/Fonts';
import { Graphics } from '@lib/graphics/Graphics';
import { ImageCache } from '@lib/graphics/images/ImageCache';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import ImageLoader from '@lib/graphics/images/ImageLoader';
import InputHandler from '@lib/input/InputHandler';
import { createCanvas, enterFullScreen, isMobileDevice } from '@lib/utils/dom';
import { loadAssetBundle } from '@main/assets/loadAssetBundle';
import { InventoryController } from '@main/controllers/InventoryController';
import { ShrineController } from '@main/controllers/ShrineController';
import { EngineImpl } from '@main/core/Engine';
import { Game } from '@main/core/Game';
import { GameConfig } from '@main/core/GameConfig';
import Ticker from '@main/core/Ticker';
import GameScreenViewportRenderer from '@main/graphics/renderers/GameScreenViewportRenderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';
import { ShrineMenuRenderer } from '@main/graphics/renderers/ShrineMenuRenderer';
import TopMenuRenderer from '@main/graphics/renderers/TopMenuRenderer';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { createInputHandler } from '@main/input/createInputHandler';
import { ItemFactory } from '@main/items/ItemFactory';
import { GeneratedMapFactory } from '@main/maps/generated/GeneratedMapFactory';
import { PredefinedMapFactory } from '@main/maps/predefined/PredefinedMapFactory';
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
import TileFactory from '@main/tiles/TileFactory';
import UnitFactory from '@main/units/UnitFactory';
import { showTitleScreen } from './actions/showTitleScreen';
import { DebugController } from './core/DebugController';
import { GameStateImpl } from './core/GameState';
import { FontFactory } from './graphics/Fonts';
import { ItemController } from './items/ItemController';
import { MapControllerImpl } from './maps/MapController';
import { MapHydrator } from './maps/MapHydrator';
import { Feature } from './utils/features';

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
}>;

const setupContainer = async ({ gameConfig }: Props): Promise<GameContainer> => {
  const { assetBundle } = gameConfig;
  const imageLoader = new ImageLoader(assetBundle);
  const imageFactory = new ImageFactory(imageLoader, new ImageCache());
  const fontFactory = new FontFactory(imageFactory);
  const fontBundle = await fontFactory.loadFonts();
  const textRenderer = new TextRenderer(gameConfig, fontBundle);
  const soundPlayer = SoundPlayer.forSounds();
  const musicController = new MusicController(SoundPlayer.forMusic());

  const spriteFactory = new SpriteFactory(assetBundle, imageFactory);
  const tileFactory = new TileFactory(assetBundle, spriteFactory);
  const itemFactory = new ItemFactory(assetBundle, spriteFactory);
  const unitFactory = new UnitFactory(assetBundle, spriteFactory, itemFactory);
  const objectFactory = new ObjectFactory(assetBundle, spriteFactory, unitFactory);
  const projectileFactory = new ProjectileFactory(spriteFactory);
  const predefinedMapFactory = new PredefinedMapFactory(imageFactory, assetBundle);
  const itemController = new ItemController({ assetBundle });
  const generatedMapFactory = new GeneratedMapFactory({ assetBundle, itemController });
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
    musicController
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
    musicController,
    projectileFactory,
    soundPlayer,
    mapController,
    inventoryController,
    shrineController,
    itemController,
    ticker: new Ticker()
  };
  const inputHandler = createInputHandler({ game });
  const debugController = new DebugController(game, mapController, itemFactory);

  const characterScene = new CharacterScene(game, textRenderer, imageFactory);
  const shrineMenuRenderer = new ShrineMenuRenderer(game, textRenderer, imageFactory);
  const viewportRenderer = new GameScreenViewportRenderer(
    game,
    imageFactory,
    shrineMenuRenderer
  );
  const hudRenderer = new HUDRenderer(game, textRenderer, imageFactory);
  const topMenuRenderer = new TopMenuRenderer(imageFactory);
  const gameScene = new GameScene(
    game,
    mapController,
    textRenderer,
    viewportRenderer,
    hudRenderer,
    topMenuRenderer,
    soundPlayer
  );
  const gameOverScene = new GameOverScene(imageFactory, textRenderer, game);
  const helpScene = new HelpScene(game, textRenderer, imageFactory);
  const inventoryScene = new InventoryScene(game, textRenderer, imageFactory);
  const mapScene = new MapScene(game);
  const titleScene = new TitleScene(game, mapController, imageFactory, textRenderer);
  const victoryScene = new VictoryScene(textRenderer, imageFactory, game);

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
    scenes
  };
};

const init = async ({ rootElement, gameConfig }: Props) => {
  const container = await setupContainer({ rootElement, gameConfig });
  const { game, inputHandler, scenes } = container;
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
    const debug = container.debugController;
    debug.attachToWindow();
  }

  const { state } = game;
  for (const scene of Object.values(scenes)) {
    state.addScene(scene);
  }

  inputHandler.addEventListener(canvas);

  await showTitleScreen(game);
  setInterval(async () => {
    const currentScene = state.getCurrentScene();
    if (currentScene) {
      await currentScene.render(canvasGraphics);
    }
  }, 20);
};

const main = async () => {
  const rootElement = checkNotNull(document.getElementById('container'));
  const assetBundle = await loadAssetBundle();
  const gameConfig: GameConfig = {
    assetBundle,
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
