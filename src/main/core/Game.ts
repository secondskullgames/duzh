import { Engine } from '@main/core/Engine';
import { GameState } from '@main/core/GameState';
import { GameConfig } from '@main/core/GameConfig';
import { ItemFactory } from '@main/items/ItemFactory';
import UnitFactory from '@main/units/UnitFactory';
import ObjectFactory from '@main/objects/ObjectFactory';
import MusicController from '@main/sounds/MusicController';
import ProjectileFactory from '@main/objects/ProjectileFactory';
import ModelLoader from '@main/assets/ModelLoader';
import SoundPlayer from '@lib/audio/SoundPlayer';
import Ticker from '@main/core/Ticker';
import { MapController } from '@main/maps/MapController';
import { InventoryController } from '@main/controllers/InventoryController';
import { ShrineController } from '@main/controllers/ShrineController';

export type Game = Readonly<{
  config: GameConfig;
  engine: Engine;
  state: GameState;
  itemFactory: ItemFactory;
  unitFactory: UnitFactory;
  objectFactory: ObjectFactory;
  musicController: MusicController;
  projectileFactory: ProjectileFactory;
  modelLoader: ModelLoader;
  soundPlayer: SoundPlayer;
  mapController: MapController;
  inventoryController: InventoryController;
  shrineController: ShrineController;
  ticker: Ticker;
}>;

export const Game = Symbol('Game');
