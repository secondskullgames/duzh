import GameState from '../../core/GameState';
import EquipmentClass from '../../equipment/EquipmentClass';
import ItemClass from '../../items/ItemClass';
import ItemFactory from '../../items/ItemFactory';
import MapItem from '../../objects/MapItem';
import Coordinates from '../../geometry/Coordinates';
import Tile from '../../tiles/Tile';
import { HUMAN_CAUTIOUS, HUMAN_REDESIGN } from '../../units/controllers/AIUnitControllers';
import Unit from '../../units/Unit';
import UnitClass from '../../units/UnitClass';
import UnitFactory from '../../units/UnitFactory';
import MapInstance from '../MapInstance';

type Props = {
  level: number,
  width: number,
  height: number,
  tiles: Tile[][],
  playerUnitLocation: Coordinates,
  enemyUnitLocations: Coordinates[],
  itemLocations: Coordinates[],
  enemyUnitClasses: Map<UnitClass, number>,
  equipmentClasses: Map<EquipmentClass, number>,
  itemClasses: Map<ItemClass, number>
};

class GeneratedMapBuilder {
  private readonly level: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: Tile[][];
  private readonly playerUnitLocation: Coordinates;
  private readonly enemyUnitLocations: Coordinates[];
  private readonly itemLocations: Coordinates[];
  private readonly enemyUnitClasses: Map<UnitClass, number>;
  private readonly equipmentClasses: Map<EquipmentClass, number>;
  private readonly itemClasses: Map<ItemClass, number>;

  constructor({
    level,
    width,
    height,
    tiles,
    playerUnitLocation,
    enemyUnitLocations,
    enemyUnitClasses,
    itemLocations,
    equipmentClasses,
    itemClasses
  }: Props) {
    this.level = level;
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.playerUnitLocation = playerUnitLocation;
    this.enemyUnitLocations = enemyUnitLocations;
    this.itemLocations = itemLocations;
    this.enemyUnitClasses = enemyUnitClasses;
    this.equipmentClasses = equipmentClasses;
    this.itemClasses = itemClasses;
  }

  build = async (): Promise<MapInstance> => {
    const playerUnit = GameState.getInstance().getPlayerUnit();
    [playerUnit.x, playerUnit.y] = [this.playerUnitLocation.x, this.playerUnitLocation.y];
    const units = [playerUnit];
    const items: MapItem[] = [];

    const unitPromises: Promise<Unit>[] = [];
    let i = 0;

    for (const [unitClass, count] of this.enemyUnitClasses) {
      for (let j = 0; j < count; j++) {
        const { x, y } = this.enemyUnitLocations[i];
        const promise = UnitFactory.createUnit({
          name: unitClass.name, // TODO unique names?
          unitClass,
          controller: HUMAN_REDESIGN,
          faction: 'ENEMY',
          coordinates: { x, y },
          level: this.level
        });
        unitPromises.push(promise);
        i++;
      }
    }

    const itemPromises: Promise<MapItem>[] = [];
    i = 0;
    for (const [equipmentClass, count] of this.equipmentClasses) {
      for (let j = 0; j < count; j++) {
        const { x, y } = this.itemLocations[i];
        const item = ItemFactory.createMapEquipment(equipmentClass, { x, y });
        itemPromises.push(item);
        i++;
      }
    }

    for (const [itemClass, count] of this.itemClasses) {
      for (let j = 0; j < count; j++) {
        const { x, y } = this.itemLocations[i];
        const item = ItemFactory.createMapItem(itemClass, { x, y });
        itemPromises.push(item);
        i++;
      }
    }

    const [resolvedUnits, resolvedItems] = await Promise.all([Promise.all(unitPromises), Promise.all(itemPromises)]);
    units.push(...resolvedUnits);
    items.push(...resolvedItems);

    return new MapInstance({
      width: this.width,
      height: this.height,
      tiles: this.tiles,
      units,
      items,
      doors: [],
      spawners: [],
      music: null
    });
  };
}

export default GeneratedMapBuilder;
