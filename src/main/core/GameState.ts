import MapInstance from '../maps/MapInstance';
import { checkArgument } from '../utils/preconditions';
import { MapSupplier } from '../maps/MapSupplier';
import { clear } from '../utils/arrays';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../entities/units/UnitFactory';
import ObjectFactory from '../entities/objects/ObjectFactory';
import MapSpec from '../schemas/MapSpec';
import MusicController from '../sounds/MusicController';
import SoundPlayer from '../sounds/SoundPlayer';
import ProjectileFactory from '../entities/objects/ProjectileFactory';
import { inject, injectable } from 'inversify';

/**
 * Represents the "game world": persistent state that is shared across all current sessions.
 */
export interface GameState {
  getMapSpecs: () => MapSpec[];
  addMaps: (suppliers: MapSupplier[]) => void;
  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
  reset: () => void;
  hasNextMap: (currentIndex: number) => boolean;
  /**
   * TODO wrong place to put this method
   */
  loadMap: (mapIndex: number) => Promise<MapInstance>;

  // TODO trying to find ways to remove the remainder

  getAnimationFactory: () => AnimationFactory;
  getItemFactory: () => ItemFactory;
  getUnitFactory: () => UnitFactory;
  getObjectFactory: () => ObjectFactory;
  getProjectileFactory: () => ProjectileFactory;
  getSoundPlayer: () => SoundPlayer;
  getMusicController: () => MusicController;
}

export namespace GameState {
  export const SYMBOL: symbol = Symbol('GameState');
  export const SYMBOL_MAP_SPECS: symbol = Symbol('GameState_MapSpecs');
}

/**
 * Global mutable state
 */
@injectable()
export class GameStateImpl implements GameState {
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: Record<number, MapInstance>;
  private readonly generatedEquipmentIds: string[];
  private readonly soundPlayer: SoundPlayer;

  constructor(
    @inject(GameState.SYMBOL_MAP_SPECS)
    private readonly mapSpecs: MapSpec[],
    @inject(AnimationFactory)
    private readonly animationFactory: AnimationFactory,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(ObjectFactory)
    private readonly objectFactory: ObjectFactory,
    @inject(MusicController)
    private readonly musicController: MusicController,
    @inject(ProjectileFactory)
    private readonly projectileFactory: ProjectileFactory
  ) {
    this.mapSuppliers = [];
    this.maps = [];
    this.generatedEquipmentIds = [];
    this.soundPlayer = new SoundPlayer({ polyphony: 1, gain: 0.15 });
  }

  getMapSpecs = (): MapSpec[] => this.mapSpecs;

  addMaps = (suppliers: MapSupplier[]) => {
    this.mapSuppliers.push(...suppliers);
  };

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    clear(this.mapSuppliers);
    Object.keys(this.maps).forEach(key => {
      delete this.maps[parseInt(key)];
    });
    clear(this.generatedEquipmentIds);
  };

  hasNextMap = (currentIndex: number) => currentIndex < this.mapSuppliers.length - 1;

  loadMap = async (mapIndex: number): Promise<MapInstance> => {
    checkArgument(
      mapIndex >= 0 && mapIndex < this.mapSuppliers.length,
      'Invalid map index: ' + mapIndex
    );
    if (!this.maps[mapIndex]) {
      const mapSupplier = this.mapSuppliers[mapIndex];
      const map = await mapSupplier();
      this.maps[mapIndex] = map;
    }
    return this.maps[mapIndex];
  };

  getAnimationFactory = (): AnimationFactory => this.animationFactory;
  getItemFactory = (): ItemFactory => this.itemFactory;
  getUnitFactory = (): UnitFactory => this.unitFactory;
  getObjectFactory = (): ObjectFactory => this.objectFactory;
  getProjectileFactory = (): ProjectileFactory => this.projectileFactory;
  getSoundPlayer = (): SoundPlayer => this.soundPlayer;
  getMusicController = (): MusicController => this.musicController;
}
