import { Coordinates, Rect, Room, Tile } from '../types';
import Unit from './Unit';
import Tiles from '../types/Tiles';
import MapItem from './MapItem';

class MapInstance {
  width: number;
  height: number;
  /**
   * [y][x]
   */
  tiles: Tile[][];
  rooms: Room[];
  units: Unit[];
  items: MapItem[];
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
    this.tiles = tiles;
    this.rooms = rooms;
    this.units = units;
    this.items = items;
    this.revealedTiles = [];
  }

  getTile({ x, y }: Coordinates): Tile {
    if (x < this.width && y < this.height) {
      return (this.tiles[y] || [])[x] || Tiles.NONE;
    }
    throw `Illegal coordinates ${x}, ${y}`;
  }

  getUnit({ x, y }: Coordinates): (Unit | null) {
    return this.units.filter(u => u.x === x && u.y === y)[0] || null;
  }

  getItem({ x, y }: Coordinates): (MapItem | null) {
    return this.items.filter(i => i.x === x && i.y === y)[0] || null;
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

  removeItem({ x, y }: Coordinates) {
    const index = this.items.findIndex(i => (i.x === x && i.y === y));
    this.items.splice(index, 1);
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
