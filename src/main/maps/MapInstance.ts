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
import Object from '../entities/objects/Object';
import Grid from '../types/Grid';

type Props = Readonly<{
  width: number,
  height: number,
  tiles: Tile[][],
  units: Unit[],
  objects: Object[],
  music: Figure[] | null
}>;

export default class MapInstance {
  readonly width: number;
  readonly height: number;
  /**
   * [y][x]
   */
  private readonly _tiles: Tile[][];
  /**
   * does NOT include tiles
   */
  private readonly _entities: Grid<Entity>;
  private readonly units: Set<Unit>;
  private readonly objects: Set<Object>;
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
    this._tiles = tiles;
    this.units = new Set(units);
    this.objects = new Set(objects);
    this.projectiles = new Set();
    this._entities = new Grid({ width, height });
    for (const entity of [...units, ...objects]) {
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

  getUnit = ({ x, y }: Coordinates): (Unit | null) => {
    const entity = this._entities.get({ x, y })
      .find(entity => entity.getType() === 'unit');
    return entity ? entity as Unit : null;
  }

  getAllUnits = (): Unit[] => [...this.units];

  getObjects = ({ x, y }: Coordinates): Object[] =>
    [...this.objects].filter(object => Coordinates.equals(object.getCoordinates(), { x, y }));

  getAllObjects = (): Object[] => [...this.objects];

  getSpawner = (coordinates: Coordinates): Spawner | null => {
    return this.getObjects(coordinates)
      .filter(object => object.getObjectType() === 'spawner')
      .map(object => object as Spawner)
      .find(() => true) ?? null;
  };

  getItem = (coordinates: Coordinates): MapItem | null => {
    return this.getObjects(coordinates)
      .filter(object => object.getObjectType() === 'item')
      .map(object => object as MapItem)
      .find(() => true) ?? null;
  };

  getDoor = (coordinates: Coordinates): Door | null => {
    return this.getObjects(coordinates)
      .filter(object => object.getObjectType() === 'door')
      .map(object => object as Door)
      .find(() => true) ?? null;
  };

  getProjectile = (coordinates: Coordinates): (Projectile | null) =>
    [...this.projectiles].find(projectile => Coordinates.equals(projectile.getCoordinates(), coordinates)) ?? null;

  contains = ({ x, y }: Coordinates): boolean =>
    (x >= 0 && x < this.width)
    && (y >= 0 && y < this.height);

  isBlocked = ({ x, y }: Coordinates): boolean => {
    checkArgument(this.contains({ x, y }), `(${x}, ${y}) is not on the map`);
    if (this._tiles[y][x].isBlocking()) {
      return true;
    }
    return this._entities.get({ x, y })
      .some(e => e.isBlocking());
  };

  addUnit = (unit: Unit) => {
    checkState(!this.units.has(unit));
    this.units.add(unit);
    const coordinates = unit.getCoordinates();
    this._entities.put(coordinates, unit);
  };

  removeUnit = (unit: Unit) => {
    const coordinates = unit.getCoordinates();
    checkState(this.units.has(unit));
    this.units.delete(unit);
    this._entities.remove(coordinates, unit);
  };

  removeObject = (object: Object) => {
    if (this.objects.has(object)) {
      this.objects.delete(object);
    }
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

  unitExists = (unit: Unit): boolean => this.units.has(unit);
}
