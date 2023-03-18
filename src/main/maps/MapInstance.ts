import Rect from '../geometry/Rect';
import Door from '../entities/objects/Door';
import MapItem from '../entities/objects/MapItem';
import Coordinates from '../geometry/Coordinates';
import Spawner from '../entities/objects/Spawner';
import { Figure } from '../sounds/types';
import Tile from '../tiles/Tile';
import Unit from '../entities/units/Unit';
import { checkArgument, checkState } from '../utils/preconditions';
import Projectile from '../types/Projectile';
import Entity from '../entities/Entity';
import Grid from '../types/Grid';

type Props = Readonly<{
  width: number,
  height: number,
  tiles: Tile[][],
  doors: Door[],
  spawners: Spawner[],
  units: Unit[],
  items: MapItem[],
  music: Figure[] | null
}>;

export default class MapInstance {
  readonly width: number;
  readonly height: number;
  /**
   * [y][x]
   */
  private readonly _tiles: Tile[][];
  private readonly _entities: Grid<Entity>;
  readonly units: Unit[];
  readonly items: MapItem[];
  readonly doors: Door[];
  readonly spawners: Spawner[];
  readonly projectiles: Projectile[];
  private readonly revealedTiles: Set<string>; // stores JSON-stringified tiles
  readonly music: Figure[] | null;

  constructor({
    width,
    height,
    tiles,
    units,
    items,
    doors,
    spawners,
    music
  }: Props) {
    this.width = width;
    this.height = height;
    this._tiles = tiles;
    this.doors = doors;
    this.spawners = spawners;
    this.units = units;
    this.items = items;
    this.projectiles = [];
    this._entities = new Grid({ width, height });
    for (const entity of [... doors, ...spawners, ...units, ...items]) {
      const { x, y } = entity.getCoordinates();
      this._entities.put({ x, y }, entity);
    }
    this.revealedTiles = new Set();
    this.music = music;
  }

  getTile = ({ x, y }: Coordinates): Tile => {
    if (x < this.width && y < this.height) {
      return (this._tiles[y] ?? [])[x] ?? 'NONE';
    }
    throw new Error(`Illegal coordinates ${x}, ${y}`);
  };

  getUnit = ({ x, y }: Coordinates): (Unit | null) =>
    this.units.find(unit => Coordinates.equals(unit.getCoordinates(), { x, y })) ?? null;

  getItem = ({ x, y }: Coordinates): (MapItem | null) =>
    this.items.find(item => Coordinates.equals(item.getCoordinates(), { x, y })) ?? null;

  getDoor = ({ x, y }: Coordinates): (Door | null) =>
    this.doors.find(door => Coordinates.equals(door.getCoordinates(), { x, y })) ?? null;

  getSpawner = ({ x, y }: Coordinates): (Spawner | null) =>
    this.spawners.find(spawner => Coordinates.equals(spawner.getCoordinates(), { x, y })) ?? null;

  getProjectile = ({ x, y }: Coordinates): (Projectile | null) =>
    this.projectiles.find(projectile => Coordinates.equals(projectile.getCoordinates(), { x, y })) ?? null;

  contains = ({ x, y }: Coordinates): boolean =>
    (x >= 0 && x < this.width)
    && (y >= 0 && y < this.height);

  isBlocked = ({ x, y }: Coordinates): boolean => {
    checkArgument(this.contains({ x, y }), `(${x}, ${y}) is not on the map`);
    return !!this.getUnit({ x, y })
      || this.getDoor({ x, y })?.isClosed()
      || this.getTile({ x, y }).isBlocking()
      || this.getSpawner({ x, y })?.isBlocking()
      || false;
  };

  addUnit = (unit: Unit) => {
    this.units.push(unit);
    const { x, y } = unit.getCoordinates();
    this._entities.put({ x, y }, unit);
  };

  removeUnit = (unit: Unit) => {
    const { x, y } = unit.getCoordinates();
    const index = this.units.indexOf(unit);
    checkState(index >= 0);
    this.units.splice(index, 1);
    this._entities.remove({ x, y }, unit);
  };

  removeItem = ({ x, y }: Coordinates) => {
    const index = this.items.findIndex(item => Coordinates.equals(item.getCoordinates(), { x, y }));
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  };

  removeProjectile = ({ x, y }: Coordinates) => {
    const index = this.projectiles.findIndex(projectile => Coordinates.equals(projectile.getCoordinates(), { x, y }));
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

  isTileRevealed = ({ x, y }: Coordinates): boolean =>
    // @ts-ignore
    window.jwb.debug.isMapRevealed() || this.revealedTiles.has(JSON.stringify({ x, y }));

  revealTile = ({ x, y }: Coordinates) =>
    this.revealedTiles.add(JSON.stringify({ x, y }));

  unitExists = (unit: Unit): boolean => !!this.units.find(u => u === unit);
}
