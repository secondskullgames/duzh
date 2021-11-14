import GameState from '../core/GameState';
import Tile from '../types/Tile';
import { Coordinates, Room } from '../types/types';
import Unit from '../units/Unit';
import MapItem from '../items/MapItem';
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
  private readonly enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Promise<Unit>;
  private readonly itemSupplier: ({ x, y }: Coordinates, level: number) => Promise<MapItem>;

  constructor(
    level: number,
    width: number,
    height: number,
    tiles: Tile[][],
    rooms: Room[],
    playerUnitLocation: Coordinates,
    enemyUnitLocations: Coordinates[],
    enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Promise<Unit>,
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
    this.enemyUnitSupplier = enemyUnitSupplier;
    this.itemSupplier = itemSupplier;
  }

  build = async (): Promise<MapInstance> => {
    const { playerUnit } = GameState.getInstance();
    [playerUnit.x, playerUnit.y] = [this.playerUnitLocation.x, this.playerUnitLocation.y];
    const units = [playerUnit];
    for (const { x, y } of this.enemyUnitLocations) {
      const enemyUnit = await this.enemyUnitSupplier({ x, y }, this.level);
      units.push(enemyUnit);
    }
    const items: MapItem[] = [];
    for (const { x, y } of this.itemLocations) {
      const item = await this.itemSupplier({ x, y }, this.level);
      items.push(item);
    }

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
