import { Engine } from '@main/core/Engine';
import { Session } from '@main/core/Session';
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

export type Game = Readonly<{
  config: GameConfig;
  engine: Engine;
  session: Session;
  itemFactory: ItemFactory;
  unitFactory: UnitFactory;
  objectFactory: ObjectFactory;
  musicController: MusicController;
  projectileFactory: ProjectileFactory;
  modelLoader: ModelLoader;
  soundPlayer: SoundPlayer;
  mapController: MapController;
  ticker: Ticker;
}>;

export const Game = Symbol('Game');
