import { GameConfig } from '@main/core/GameConfig';
import mapSpecsJson from '@data/maps.json';
import { MapSpec } from '@models/MapSpec';
import { FontFactory } from '@main/graphics/Fonts';
import ImageLoader from '@lib/graphics/images/ImageLoader';
import { AssetLoader, AssetLoaderImpl } from '@lib/assets/AssetLoader';
import { FontBundle } from '@lib/graphics/Fonts';
import { ImageCache } from '@lib/graphics/images/ImageCache';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import UnitFactory from '@main/units/UnitFactory';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import ModelLoader from '@main/assets/ModelLoader';
import { ItemFactory } from '@main/items/ItemFactory';
import ObjectFactory from '@main/objects/ObjectFactory';
import SoundPlayer from '@lib/audio/SoundPlayer';
import MusicController from '@main/sounds/MusicController';
import { MapController, MapControllerImpl } from '@main/maps/MapController';
import MapFactory from '@main/maps/MapFactory';
import TileFactory from '@main/tiles/TileFactory';
import { Engine, EngineImpl } from '@main/core/Engine';
import { GameState, GameStateImpl } from '@main/core/GameState';
import { Session, SessionImpl } from '@main/core/Session';
import { OrderExecutor } from '@main/units/orders/OrderExecutor';
import { Debug } from '@main/core/Debug';
import { TextRenderer } from '@main/graphics/TextRenderer';
import ProjectileFactory from '@main/objects/ProjectileFactory';
import Ticker from '@main/core/Ticker';

export interface IGlobals {
  assetLoader: AssetLoader;
  debug: Debug;
  engine: Engine;
  fontBundle: FontBundle;
  gameConfig: GameConfig;
  imageFactory: ImageFactory;
  itemFactory: ItemFactory;
  mapController: MapController;
  mapFactory: MapFactory;
  modelLoader: ModelLoader;
  musicController: MusicController;
  objectFactory: ObjectFactory;
  orderExecutor: OrderExecutor;
  projectileFactory: ProjectileFactory;
  session: Session;
  soundPlayer: SoundPlayer;
  spriteFactory: SpriteFactory;
  state: GameState;
  textRenderer: TextRenderer;
  ticker: Ticker;
  tileFactory: TileFactory;
  unitFactory: UnitFactory;
}

const gameConfig: GameConfig = {
  mapSpecs: mapSpecsJson as MapSpec[],
  screenWidth: 640,
  screenHeight: 360
};

const assetLoader = new AssetLoaderImpl();
const imageLoader = new ImageLoader();
const imageCache = new ImageCache();
const imageFactory = new ImageFactory(imageLoader, imageCache);
const fontFactory = new FontFactory();
const fontBundle = await fontFactory.loadFonts();
const textRenderer = new TextRenderer({
  width: gameConfig.screenWidth,
  height: gameConfig.screenHeight
});

const modelLoader = new ModelLoader();
const spriteFactory = new SpriteFactory();
const itemFactory = new ItemFactory();
const unitFactory = new UnitFactory();
const objectFactory = new ObjectFactory();
const projectileFactory = new ProjectileFactory();
const soundPlayer = SoundPlayer.forSounds();
const musicController = new MusicController(SoundPlayer.forMusic());
const mapFactory = new MapFactory();
const tileFactory = new TileFactory();

const state = new GameStateImpl();
const session = new SessionImpl();
const ticker = new Ticker();
const orderExecutor = new OrderExecutor();
const engine = new EngineImpl();
const mapController = new MapControllerImpl();
const debug = new Debug();

export const Globals: IGlobals = {
  assetLoader,
  debug,
  fontBundle,
  engine,
  gameConfig,
  imageFactory,
  itemFactory,
  mapController,
  mapFactory,
  modelLoader,
  musicController,
  objectFactory,
  orderExecutor,
  projectileFactory,
  session,
  soundPlayer,
  spriteFactory,
  state,
  textRenderer,
  ticker,
  tileFactory,
  unitFactory
};
