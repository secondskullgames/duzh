import MapItem from '../items/MapItem';
import Tile from '../types/Tile';
import { Coordinates, Entity, Rect, Room } from '../types/types';
import Unit from '../units/Unit';

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
  projectiles: Entity[];
  revealedTiles: Coordinates[];

  constructor(
    width: number,
    height: number,
    tiles: Tile[][],
    rooms: Room[],
    units: Unit[],
    items: MapItem[]
  ) {
    this.width = width;
    this.height = height;
    this._tiles = tiles;
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
    return !!this.getUnit({ x, y }) || this.getTile({ x, y }).isBlocking;
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
