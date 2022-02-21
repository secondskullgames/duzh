import Door from '../objects/Door';
import MapItem from '../objects/MapItem';
import Coordinates from '../geometry/Coordinates';
import Tile from '../tiles/Tile';
import { Entity, Rect, Room } from '../types/types';
import Unit from '../units/Unit';
import { checkArgument } from '../utils/preconditions';

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
  private readonly _rooms: Room[];
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
    this._rooms = rooms;
    this.units = units;
    this.items = items;
    this.projectiles = [];
    this.revealedTiles = [];
  }

  getRooms = (): Room[] => this._rooms;

  getTile = ({ x, y }: Coordinates): Tile => {
    if (x < this.width && y < this.height) {
      return (this._tiles[y] || [])[x] || 'NONE';
    }
    throw new Error(`Illegal coordinates ${x}, ${y}`);
  };

  getUnit = ({ x, y }: Coordinates): (Unit | null) =>
    this.units.find(u => u.x === x && u.y === y) || null;

  getItem = ({ x, y }: Coordinates): (MapItem | null) =>
    this.items.find(i => i.x === x && i.y === y) || null;

  getDoor = ({ x, y }: Coordinates): (Door | null) =>
    this.doors.find(d => d.x === x && d.y === y) || null;

  getProjectile = ({ x, y }: Coordinates): (Entity | null) =>
    this.projectiles.find(p => p.x === x && p.y === y) || null;

  contains = ({ x, y }: Coordinates): boolean =>
    (x >= 0 && x < this.width)
    && (y >= 0 && y < this.height);

  isBlocked = ({ x, y }: Coordinates): boolean => {
    checkArgument(this.contains({ x, y }), `(${x}, ${y}) is not on the map`);
    return !!this.getUnit({ x, y })
      || this.getDoor({ x, y })?.isClosed()
      || this.getTile({ x, y }).isBlocking;
  };

  removeUnit = ({ x, y }: Coordinates) => {
    const index = this.units.findIndex(u => (u.x === x && u.y === y));
    if (index >= 0) {
      this.units.splice(index, 1);
    }
  };

  removeItem = ({ x, y }: Coordinates) => {
    const index = this.items.findIndex(i => (i.x === x && i.y === y));
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  };

  removeProjectile = ({ x, y }: Coordinates) => {
    const index = this.projectiles.findIndex(i => (i.x === x && i.y === y));
    if (index >= 0) {
      this.projectiles.splice(index, 1);
    }
  };

  getRect = (): Rect => ({
    left: 0,
    top: 0,
    width: this.width,
    height: this.height
  });
}

export default MapInstance
