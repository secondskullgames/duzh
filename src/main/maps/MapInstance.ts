import Door from '../objects/Door';
import MapItem from '../objects/MapItem';
import Coordinates from '../geometry/Coordinates';
import Tile from '../tiles/Tile';
import { Entity, Rect, Room } from '../types/types';
import Unit from '../units/Unit';

type Props = {
  width: number,
  height: number,
  tiles: Tile[][],
  doors: Door[],
  rooms: Room[],
  units: Unit[],
  items: MapItem[]
};

class MapInstance {
  width: number;
  height: number;
  /**
   * [y][x]
   */
  private readonly _tiles: Tile[][];
  rooms: Room[];
  units: Unit[];
  items: MapItem[];
  doors: Door[];
  projectiles: Entity[];
  revealedTiles: Coordinates[];

  constructor({
    width,
    height,
    tiles,
    rooms,
    units,
    items,
    doors
  }: Props) {
    this.width = width;
    this.height = height;
    this._tiles = tiles;
    this.doors = doors;
    this.rooms = rooms;
    this.units = units;
    this.items = items;
    this.projectiles = [];
    this.revealedTiles = [];
  }

  getTile({ x, y }: Coordinates): Tile {
    if (x < this.width && y < this.height) {
      return (this._tiles[y] || [])[x] || 'NONE';
    }
    throw `Illegal coordinates ${x}, ${y}`;
  }

  getUnit({ x, y }: Coordinates): (Unit | null) {
    return this.units.filter(u => u.x === x && u.y === y)[0] || null;
  }

  getItem({ x, y }: Coordinates): (MapItem | null) {
    return this.items.filter(i => i.x === x && i.y === y)[0] || null;
  }

  getDoor({ x, y }: Coordinates): (Door | null) {
    return this.doors.filter(d => d.x === x && d.y === y)[0] || null;
  }

  getProjectile({ x, y }: Coordinates): (Entity | null) {
    return this.projectiles.filter(p => p.x === x && p.y === y)[0] || null;
  }

  contains({ x, y }: Coordinates): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isBlocked({ x, y }: Coordinates): boolean {
    if (!this.contains({ x, y })) {
      throw `(${x}, ${y}) is not on the map`;
    }
    return !!this.getUnit({ x, y })
      || this.getDoor({ x, y })?.isClosed()
      || this.getTile({ x, y }).isBlocking;
  }

  removeUnit({ x, y }: Coordinates) {
    const index = this.units.findIndex(u => (u.x === x && u.y === y));
    if (index >= 0) {
      this.units.splice(index, 1);
    }
  }

  removeItem({ x, y }: Coordinates) {
    const index = this.items.findIndex(i => (i.x === x && i.y === y));
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  removeProjectile({ x, y }: Coordinates) {
    const index = this.projectiles.findIndex(i => (i.x === x && i.y === y));
    if (index >= 0) {
      this.projectiles.splice(index, 1);
    }
  }

  getRect(): Rect {
    return {
      left: 0,
      top: 0,
      width: this.width,
      height: this.height
    };
  }
}

export default MapInstance
