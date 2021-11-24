import GameState from '../core/GameState';
import MapItem from '../items/MapItem';
import Tile from '../types/Tile';
import { Coordinates, Room } from '../types/types';
import { HUMAN_DETERMINISTIC } from '../units/controllers/AIUnitControllers';
import Unit from '../units/Unit';
import UnitClass from '../units/UnitClass';
import UnitFactory from '../units/UnitFactory';
import { randChoice } from '../utils/random';
import MapInstance from './MapInstance';

class MapBuilder {
  private readonly level: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: Tile[][];
  private readonly rooms: Room[];
  private readonly playerUnitLocation: Coordinates;
  private readonly enemyUnitLocations: Coordinates[];
  private readonly itemLocations: Coordinates[];
  private readonly enemyUnitClasses: UnitClass[];
  private readonly itemSupplier: ({ x, y }: Coordinates, level: number) => Promise<MapItem>;

  constructor(
    level: number,
    width: number,
    height: number,
    tiles: Tile[][],
    rooms: Room[],
    playerUnitLocation: Coordinates,
    enemyUnitLocations: Coordinates[],
    enemyUnitClasses: UnitClass[],
    itemLocations: Coordinates[],
    itemSupplier: ({ x, y }: Coordinates, level: number) => Promise<MapItem>
  ) {
    this.level = level;
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.rooms = rooms;
    this.playerUnitLocation = playerUnitLocation;
    this.enemyUnitLocations = enemyUnitLocations;
    this.itemLocations = itemLocations;
    this.enemyUnitClasses = enemyUnitClasses;
    this.itemSupplier = itemSupplier;
  }

  build = async (): Promise<MapInstance> => {
    const { playerUnit } = GameState.getInstance();
    [playerUnit.x, playerUnit.y] = [this.playerUnitLocation.x, this.playerUnitLocation.y];
    const units = [playerUnit];
    const items: MapItem[] = [];

    const unitPromises: Promise<Unit>[] = [];
    for (const { x, y } of this.enemyUnitLocations) {
      const unitClass = randChoice(this.enemyUnitClasses);
      const promise = UnitFactory.createUnit({
        name: unitClass.name, // TODO unique names?
        unitClass,
        controller: HUMAN_DETERMINISTIC,
        coordinates: { x, y },
        level: this.level
      });
      unitPromises.push(promise);
    }

    const itemPromises: Promise<MapItem>[] = [];
    for (const { x, y } of this.itemLocations) {
      itemPromises.push(this.itemSupplier({ x, y }, this.level));
    }

    const [resolvedUnits, resolvedItems] = await Promise.all([Promise.all(unitPromises), Promise.all(itemPromises)]);
    units.push(...resolvedUnits);
    items.push(...resolvedItems);

    return new MapInstance(
      this.width,
      this.height,
      this.tiles,
      this.rooms,
      units,
      items
    );
  };
}

export default MapBuilder;
