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
  /**
   * does NOT include tiles
   */
  private readonly _entities: MultiGrid<Entity>;
  private readonly units: Set<Unit>;
  private readonly objects: Set<GameObject>;
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
    this.units = new Set(units);
    this.objects = new Set(objects);
    this.projectiles = new Set();
    this._tiles = new Grid({ width, height });
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];
        this._tiles.put({ x, y }, tile);
      }
    }
    this._entities = new MultiGrid({ width, height });
    for (const entity of [...units, ...objects]) {
      const { x, y } = entity.getCoordinates();
      this._entities.put({ x, y }, entity);
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

  getUnit = ({ x, y }: Coordinates): (Unit | null) => {
    const entity = this._entities.get({ x, y })
      .find(entity => entity.getType() === 'unit');
    return entity ? entity as Unit : null;
  }

  getAllUnits = (): Unit[] => [...this.units];

  getObjects = ({ x, y }: Coordinates): GameObject[] =>
    [...this.objects].filter(object => Coordinates.equals(object.getCoordinates(), { x, y }));

  getAllObjects = (): GameObject[] => [...this.objects];

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

  isBlocked = (coordinates: Coordinates): boolean => {
    const { x, y } = coordinates;
    checkArgument(this.contains(coordinates), `(${x}, ${y}) is not on the map`);
    if (this._tiles.get(coordinates)!.isBlocking()) {
      return true;
    }
    return this._entities.get(coordinates)
      .some(e => e.isBlocking());
  };

  addUnit = (unit: Unit) => {
    checkState(!this.units.has(unit));
    this.units.add(unit);
    const coordinates = unit.getCoordinates();
    this._entities.put(coordinates, unit);
  };

  removeUnit = (unit: Unit) => {
    checkState(this.units.has(unit));
    this.units.delete(unit);
    const coordinates = unit.getCoordinates();
    this._entities.remove(coordinates, unit);
  };

  addObject = (object: GameObject) => {
    this.objects.add(object);
    this._entities.put(object.getCoordinates(), object);
  };

  removeObject = (object: GameObject) => {
    if (this.objects.has(object)) {
      this.objects.delete(object);
    }
    this._entities.remove(object.getCoordinates(), object)
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
