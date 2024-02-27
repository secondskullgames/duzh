import Tile from '../tiles/Tile';
import GameObject from '../entities/objects/GameObject';
import MultiGrid from '../types/MultiGrid';
import Grid from '../types/Grid';
import { Unit } from '@main/entities/units';
import { Projectile } from '@main/entities';
import { Coordinates, Rect } from '@main/geometry';
import type { Figure } from '@main/sounds/types';

type Props = Readonly<{
  width: number;
  height: number;
  startingCoordinates: Coordinates;
  music?: Figure[] | null;
  fogRadius?: number | null;
}>;

export default class MapInstance {
  readonly width: number;
  readonly height: number;
  readonly startingCoordinates: Coordinates;
  private readonly tiles: Grid<Tile>;
  private readonly units: Grid<Unit>;
  private readonly objects: MultiGrid<GameObject>;
  /**
   * TODO should not expose this
   */
  readonly projectiles: Set<Projectile>;
  private readonly revealedTiles: Grid<boolean>;
  readonly music: Figure[] | null;
  private readonly fogRadius: number | null;

  constructor({ width, height, startingCoordinates, music, fogRadius }: Props) {
    this.width = width;
    this.height = height;
    this.startingCoordinates = startingCoordinates;
    this.units = new Grid({ width, height });
    this.objects = new MultiGrid({ width, height });
    this.projectiles = new Set();
    this.tiles = new Grid({ width, height });
    this.revealedTiles = new Grid({ width, height });
    this.music = music ?? null;
    this.fogRadius = fogRadius ?? null;
    if (this.fogRadius === null) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.revealTile({ x, y });
        }
      }
    }
  }

  getTile = (coordinates: Coordinates): Tile => {
    if (this.contains(coordinates)) {
      return this.tiles.get(coordinates)!;
    }
    const { x, y } = coordinates;
    throw new Error(`Illegal coordinates ${x}, ${y}`);
  };

  getTiles = (): Tile[][] => {
    const tiles: Tile[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.tiles.get({ x, y })!);
      }
      tiles.push(row);
    }
    return tiles;
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

  addTile = (tile: Tile) => {
    this.tiles.put(tile.getCoordinates(), tile);
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

  getFogRadius = (): number | null => {
    return this.fogRadius;
  };

  unitExists = (unit: Unit): boolean => {
    const coordinates = unit.getCoordinates();
    return this.units.get(coordinates) === unit;
  };

  getStartingCoordinates = (): Coordinates => this.startingCoordinates;
}
