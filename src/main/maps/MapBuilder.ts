import { Coordinates, Room, Tile } from '../types/types';
import Unit from '../units/Unit';
import MapItem from '../items/MapItem';
import MapInstance from './MapInstance';

class MapBuilder {
  private readonly _level: number;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _tiles: Tile[][];
  private readonly _rooms: Room[];
  private readonly _playerUnitLocation: Coordinates;
  private readonly _enemyUnitLocations: Coordinates[];
  private readonly _itemLocations: Coordinates[];
  private readonly _enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Unit;
  private readonly _itemSupplier: ({ x, y }: Coordinates, level: number) => MapItem;
  
  constructor(
    level: number,
    width: number,
    height: number,
    tiles: Tile[][],
    rooms: Room[],
    playerUnitLocation: Coordinates,
    enemyUnitLocations: Coordinates[],
    enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Unit,
    itemLocations: Coordinates[],
    itemSupplier: ({ x, y }: Coordinates, level: number) => MapItem
  ) {
    this._level = level;
    this._width = width;
    this._height = height;
    this._tiles = tiles;
    this._rooms = rooms;
    this._playerUnitLocation = playerUnitLocation;
    this._enemyUnitLocations = enemyUnitLocations;
    this._itemLocations = itemLocations;
    this._enemyUnitSupplier = enemyUnitSupplier;
    this._itemSupplier = itemSupplier;
  }

  build(): MapInstance {
    const { playerUnit } = jwb.state;
    const units = [playerUnit];
    [playerUnit.x, playerUnit.y] = [this._playerUnitLocation.x, this._playerUnitLocation.y];
    units.push(...this._enemyUnitLocations.map(({ x, y }) => this._enemyUnitSupplier({ x, y }, this._level)));
    const items = this._itemLocations.map(({ x, y }) => this._itemSupplier({ x, y }, this._level));
    return new MapInstance(
      this._width,
      this._height,
      this._tiles,
      this._rooms,
      units,
      items
    )
  }
}

export default MapBuilder;