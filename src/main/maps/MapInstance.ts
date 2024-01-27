import Coordinates from '../geometry/Coordinates';
import Tile from '../tiles/Tile';
import Unit from '../entities/units/Unit';
import { checkArgument } from '../utils/preconditions';
import Projectile from '../entities/Projectile';
import GameObject from '../entities/objects/GameObject';
import MultiGrid from '../types/MultiGrid';
import Grid from '../types/Grid';
import type { Figure } from '../sounds/types';
import type Rect from '../geometry/Rect';

type Props = Readonly<{
  width: number;
  height: number;
  startingCoordinates: Coordinates;
  tiles: Tile[][];
  units: Unit[];
  objects: GameObject[];
  music: Figure[] | null;
}>;

export default class MapInstance {
  readonly width: number;
  readonly height: number;
  readonly startingCoordinates: Coordinates;
  private readonly tiles: Grid<Tile>;
  private readonly units: Grid<Unit>;
  private readonly objects: MultiGrid<GameObject>;
  readonly projectiles: Set<Projectile>;
  private readonly revealedTiles: Grid<boolean>;
  readonly music: Figure[] | null;

  constructor({
    width,
    height,
    tiles,
    startingCoordinates,
    units,
    objects,
    music
  }: Props) {
    this.width = width;
    this.height = height;
    this.startingCoordinates = startingCoordinates;
    this.units = new Grid({ width, height });
    for (const unit of units) {
      this.units.put(unit.getCoordinates(), unit);
    }
    this.objects = new MultiGrid({ width, height });
    for (const object of objects) {
      this.objects.put(object.getCoordinates(), object);
    }
    this.projectiles = new Set();
    this.tiles = new Grid({ width, height });
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];
        this.tiles.put({ x, y }, tile);
      }
    }
    this.revealedTiles = new Grid({ width, height });
    this.music = music;
  }

  getTile = (coordinates: Coordinates): Tile => {
    if (this.contains(coordinates)) {
      return this.tiles.get(coordinates)!;
    }
    const { x, y } = coordinates;
    throw new Error(`Illegal coordinates ${x}, ${y}`);
  };

  getUnit = (coordinates: Coordinates): Unit | null => {
    return this.units.get(coordinates);
  };

  getAllUnits = (): Unit[] => this.units.getAll();

  getObjects = (coordinates: Coordinates): GameObject[] => {
    return this.objects.get(coordinates);
  };

  getAllObjects = (): GameObject[] => this.objects.getAll();

  getProjectile = (coordinates: Coordinates): Projectile | null =>
    [...this.projectiles].find(projectile =>
      Coordinates.equals(projectile.getCoordinates(), coordinates)
    ) ?? null;

  contains = ({ x, y }: Coordinates): boolean =>
    x >= 0 && x < this.width && y >= 0 && y < this.height;

  isBlocked = (coordinates: Coordinates): boolean => {
    const { x, y } = coordinates;
    checkArgument(this.contains(coordinates), `(${x}, ${y}) is not on the map`);

    if (this.tiles.get(coordinates)!.isBlocking()) {
      return true;
    }
    if (this.units.get(coordinates)?.isBlocking()) {
      return true;
    }
    if (this.objects.get(coordinates).some(e => e.isBlocking())) {
      return true;
    }
    return false;
  };

  addUnit = (unit: Unit) => {
    this.units.put(unit.getCoordinates(), unit);
  };

  removeUnit = (unit: Unit) => {
    this.units.remove(unit.getCoordinates(), unit);
  };

  addObject = (object: GameObject) => {
    this.objects.put(object.getCoordinates(), object);
  };

  removeObject = (object: GameObject) => {
    this.objects.remove(object.getCoordinates(), object);
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

  isTileRevealed = (coordinates: Coordinates): boolean =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb?.debug?.isMapRevealed() || !!this.revealedTiles.get(coordinates);

  revealTile = (coordinates: Coordinates) => {
    this.revealedTiles.put(coordinates, true);
  };

  unitExists = (unit: Unit): boolean => {
    const coordinates = unit.getCoordinates();
    return this.units.get(coordinates) === unit;
  };

  getStartingCoordinates = (): Coordinates => this.startingCoordinates;
}
