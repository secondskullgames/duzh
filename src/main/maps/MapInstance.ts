import Rect from '../geometry/Rect';
import Door from '../entities/objects/Door';
import MapItem from '../entities/objects/MapItem';
import Coordinates from '../geometry/Coordinates';
import Spawner from '../entities/objects/Spawner';
import { Figure } from '../sounds/types';
import Tile from '../tiles/Tile';
import Unit from '../entities/units/Unit';
import { checkArgument } from '../utils/preconditions';
import Projectile from '../types/Projectile';
import GameObject from '../entities/objects/GameObject';
import MultiGrid from '../types/MultiGrid';
import Grid from '../types/Grid';

type Props = Readonly<{
  width: number,
  height: number,
  tiles: Tile[][],
  units: Unit[],
  objects: GameObject[],
  music: Figure[] | null
}>;

export default class MapInstance {
  readonly width: number;
  readonly height: number;
  /**
   * [y][x]
   */
  private readonly _tiles: Grid<Tile>;
  private readonly _units: Grid<Unit>;
  private readonly _objects: MultiGrid<GameObject>;
  readonly projectiles: Set<Projectile>;
  private readonly revealedTiles: Set<string>; // stores JSON-stringified tiles
  readonly music: Figure[] | null;

  constructor({
    width,
    height,
    tiles,
    units,
    objects,
    music
  }: Props) {
    this.width = width;
    this.height = height;
    this._units = new Grid({ width, height });
    for (const unit of units) {
      this._units.put(unit.getCoordinates(), unit);
    }
    this._objects = new MultiGrid({ width, height });
    for (const object of objects) {
      this._objects.put(object.getCoordinates(), object);
    }
    this.projectiles = new Set();
    this._tiles = new Grid({ width, height });
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];
        this._tiles.put({ x, y }, tile);
      }
    }
    this.revealedTiles = new Set();
    this.music = music;
  }

  getTile = (coordinates: Coordinates): Tile => {
    if (this.contains(coordinates)) {
      return this._tiles.get(coordinates)!;
    }
    const { x, y } = coordinates;
    throw new Error(`Illegal coordinates ${x}, ${y}`);
  };

  getUnit = (coordinates: Coordinates): (Unit | null) => {
    return this._units.get(coordinates);
  }

  getAllUnits = (): Unit[] => this._units.getAll();

  getObjects = (coordinates: Coordinates): GameObject[] => {
    return this._objects.get(coordinates);
  };

  getAllObjects = (): GameObject[] => this._objects.getAll();

  getSpawner = (coordinates: Coordinates): Spawner | null => {
    return this.getObjects(coordinates)
      .filter(object => object.getObjectType() === 'spawner')
      .map(object => object as Spawner)[0] ?? null;
  };

  getItem = (coordinates: Coordinates): MapItem | null => {
    return this.getObjects(coordinates)
      .filter(object => object.getObjectType() === 'item')
      .map(object => object as MapItem)[0] ?? null;
  };

  getDoor = (coordinates: Coordinates): Door | null => {
    return this.getObjects(coordinates)
      .filter(object => object.getObjectType() === 'door')
      .map(object => object as Door)[0] ?? null;
  };

  getProjectile = (coordinates: Coordinates): (Projectile | null) =>
    [...this.projectiles].find(projectile => Coordinates.equals(projectile.getCoordinates(), coordinates)) ?? null;

  contains = ({ x, y }: Coordinates): boolean =>
    (x >= 0 && x < this.width)
    && (y >= 0 && y < this.height);

  isBlocked = (coordinates: Coordinates): boolean => {
    const { x, y } = coordinates;
    checkArgument(this.contains(coordinates), `(${x}, ${y}) is not on the map`);
    if (this._tiles.get(coordinates)!.isBlocking()) {
      return true;
    }
    if (this._units.get(coordinates)?.isBlocking()) {
      return true;
    }
    if (this._objects.get(coordinates).some(e => e.isBlocking())) {
      return true;
    }
    return false;
  };

  addUnit = (unit: Unit) => {
    this._units.put(unit.getCoordinates(), unit);
  };

  removeUnit = (unit: Unit) => {
    this._units.remove(unit.getCoordinates(), unit);
  };

  addObject = (object: GameObject) => {
    this._objects.put(object.getCoordinates(), object);
  };

  removeObject = (object: GameObject) => {
    this._objects.remove(object.getCoordinates(), object);
  };

  removeProjectile = (projectile: Projectile) => {
    if (this.projectiles.has(projectile)) {
      this.projectiles.delete(projectile);
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

  unitExists = (unit: Unit): boolean => {
    const coordinates = unit.getCoordinates();
    return this._units.get(coordinates) === unit;
  };
}
