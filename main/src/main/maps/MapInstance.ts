import Tile from '../tiles/Tile';
import Unit from '../units/Unit';
import Projectile from '../entities/Projectile';
import GameObject from '../objects/GameObject';
import MultiGrid from '@lib/geometry/MultiGrid';
import Grid from '@lib/geometry/Grid';
import { Coordinates } from '@lib/geometry/Coordinates';
import { FogOfWarParams } from '@duzh/models';
import { Rect } from '@lib/geometry/Rect';
import type { Figure } from '@lib/audio/types';

type Props = Readonly<{
  id: string;
  width: number;
  height: number;
  levelNumber: number;
  startingCoordinates: Coordinates;
  music?: Figure[] | null;
  fogParams: FogOfWarParams;
}>;

export default class MapInstance {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly levelNumber: number;
  readonly startingCoordinates: Coordinates;
  private readonly tiles: Grid<Tile>;
  private readonly units: Grid<Unit>;
  private readonly objects: MultiGrid<GameObject>;
  private readonly projectiles: Set<Projectile>;
  private readonly revealedTiles: Grid<boolean>;
  readonly music: Figure[] | null;
  private readonly fogParams: FogOfWarParams;

  constructor(props: Props) {
    this.id = props.id;
    const { width, height } = props;
    this.width = width;
    this.height = height;
    this.levelNumber = props.levelNumber;
    this.startingCoordinates = props.startingCoordinates;
    this.units = new Grid({ width, height });
    this.objects = new MultiGrid({ width, height });
    this.projectiles = new Set();
    this.tiles = new Grid({ width, height });
    this.revealedTiles = new Grid({ width, height });
    this.music = props.music ?? null;
    this.fogParams = props.fogParams;
    if (!this.fogParams.enabled) {
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

  addProjectile = (projectile: Projectile) => {
    this.projectiles.add(projectile);
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
    !!this.revealedTiles.get(coordinates);

  revealTile = (coordinates: Coordinates) => {
    this.revealedTiles.put(coordinates, true);
  };

  getFogParams = (): FogOfWarParams => this.fogParams;

  unitExists = (unit: Unit): boolean => {
    const coordinates = unit.getCoordinates();
    return this.units.get(coordinates) === unit;
  };

  getStartingCoordinates = (): Coordinates => this.startingCoordinates;
}
