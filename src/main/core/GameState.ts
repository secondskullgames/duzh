import MapInstance from '../maps/MapInstance';
import { checkArgument } from '../utils/preconditions';
import { MapSupplier } from '../maps/MapSupplier';
import { clear } from '../utils/arrays';
import MapFactory from '../maps/MapFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import TileFactory from '../tiles/TileFactory';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../entities/units/UnitFactory';

/**
 * Represents the "game world": persistent state that is shared across all current sessions.
 */
export interface GameState {
  addMaps: (suppliers: MapSupplier[]) => void;
  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
  reset: () => void;
  getMapFactory: () => MapFactory;
  getImageFactory: () => ImageFactory;
  getAnimationFactory: () => AnimationFactory;
  getSpriteFactory: () => SpriteFactory;
  getTileFactory: () => TileFactory;
  getItemFactory: () => ItemFactory;
  getUnitFactory: () => UnitFactory;
  hasNextMap: (currentIndex: number) => boolean;
  loadMap: (mapIndex: number) => Promise<MapInstance>;
}

type Props = Readonly<{
  imageFactory: ImageFactory;
  mapFactory: MapFactory;
  animationFactory: AnimationFactory;
  spriteFactory: SpriteFactory;
  tileFactory: TileFactory;
  itemFactory: ItemFactory;
  unitFactory: UnitFactory;
}>;

export namespace GameState {
  export const create = (props: Props): GameState => new GameStateImpl(props);
}

/**
 * Global mutable state
 */
class GameStateImpl implements GameState {
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: Record<number, MapInstance>;
  private readonly mapFactory: MapFactory;
  private readonly imageFactory: ImageFactory;
  private readonly animationFactory: AnimationFactory;
  private readonly spriteFactory: SpriteFactory;
  private readonly tileFactory: TileFactory;
  private readonly itemFactory: ItemFactory;
  private readonly unitFactory: UnitFactory;
  private readonly generatedEquipmentIds: string[];

  constructor(props: Props) {
    this.imageFactory = props.imageFactory;
    this.mapFactory = props.mapFactory;
    this.animationFactory = props.animationFactory;
    this.spriteFactory = props.spriteFactory;
    this.tileFactory = props.tileFactory;
    this.itemFactory = props.itemFactory;
    this.unitFactory = props.unitFactory;
    this.mapSuppliers = [];
    this.maps = [];
    this.generatedEquipmentIds = [];
  }

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

  getMapFactory = (): MapFactory => this.mapFactory;
  getImageFactory = (): ImageFactory => this.imageFactory;
  getAnimationFactory = (): AnimationFactory => this.animationFactory;
  getSpriteFactory = (): SpriteFactory => this.spriteFactory;
  getTileFactory = (): TileFactory => this.tileFactory;
  getItemFactory = (): ItemFactory => this.itemFactory;
  getUnitFactory = (): UnitFactory => this.unitFactory;
}
