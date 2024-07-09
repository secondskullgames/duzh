import MapInstance from '../maps/MapInstance';
import { ItemFactory } from '../items/ItemFactory';
import UnitFactory from '../units/UnitFactory';
import ObjectFactory from '../objects/ObjectFactory';
import MusicController from '../sounds/MusicController';
import ProjectileFactory from '../objects/ProjectileFactory';
import SoundPlayer from '@lib/audio/SoundPlayer';
import { clear } from '@lib/utils/arrays';
import ModelLoader from '@main/assets/ModelLoader';
import { inject, injectable } from 'inversify';

/**
 * Represents the "game world": persistent state that is shared across all current sessions.
 */
export interface GameState {
  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
  reset: () => void;

  getMap: (mapIndex: number) => MapInstance;
  setMap: (mapIndex: number, map: MapInstance) => void;
  isMapLoaded: (mapIndex: number) => boolean;

  // TODO trying to find ways to remove the remainder

  getItemFactory: () => ItemFactory;
  getUnitFactory: () => UnitFactory;
  getObjectFactory: () => ObjectFactory;
  getProjectileFactory: () => ProjectileFactory;
  getSoundPlayer: () => SoundPlayer;
  getMusicController: () => MusicController;
  getModelLoader: () => ModelLoader;
}

export const GameState = Symbol('GameState');

/**
 * Global mutable state
 */
@injectable()
export class GameStateImpl implements GameState {
  private readonly maps: Record<number, MapInstance>;
  private readonly generatedEquipmentIds: string[];
  private readonly soundPlayer: SoundPlayer;

  constructor(
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(ObjectFactory)
    private readonly objectFactory: ObjectFactory,
    @inject(MusicController)
    private readonly musicController: MusicController,
    @inject(ProjectileFactory)
    private readonly projectileFactory: ProjectileFactory,
    @inject(ModelLoader)
    private readonly modelLoader: ModelLoader
  ) {
    this.maps = [];
    this.generatedEquipmentIds = [];
    this.soundPlayer = new SoundPlayer({ polyphony: 1, gain: 0.15 });
  }

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    Object.keys(this.maps).forEach(key => {
      delete this.maps[parseInt(key)];
    });
    clear(this.generatedEquipmentIds);
  };

  isMapLoaded = (index: number): boolean => {
    return this.maps[index] !== undefined;
  };

  setMap = (mapIndex: number, map: MapInstance) => {
    this.maps[mapIndex] = map;
  };
  getMap = (mapIndex: number) => this.maps[mapIndex];

  getItemFactory = (): ItemFactory => this.itemFactory;
  getUnitFactory = (): UnitFactory => this.unitFactory;
  getObjectFactory = (): ObjectFactory => this.objectFactory;
  getProjectileFactory = (): ProjectileFactory => this.projectileFactory;
  getSoundPlayer = (): SoundPlayer => this.soundPlayer;
  getMusicController = (): MusicController => this.musicController;
  getModelLoader = (): ModelLoader => this.modelLoader;
}
