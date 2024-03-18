import Sprite from '../graphics/sprites/Sprite';
import Entity from '../entities/Entity';
import MapInstance from '../maps/MapInstance';
import { TileType } from '@models/TileType';
import { Coordinates } from '@lib/geometry/Coordinates';
import { EntityType } from '@main/entities/EntityType';

type Props = Readonly<{
  tileType: TileType;
  sprite: Sprite | null;
  coordinates: Coordinates;
  map: MapInstance;
}>;

export default class Tile implements Entity {
  private coordinates: Coordinates;
  private map: MapInstance;
  private readonly tileType: TileType;
  private readonly sprite: Sprite | null;

  constructor({ tileType, sprite, coordinates, map }: Props) {
    this.tileType = tileType;
    this.coordinates = coordinates;
    this.map = map;
    this.sprite = sprite;
  }

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;
  /** @override {@link Entity#setCoordinates} */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  /** @override */
  getMap = (): MapInstance => this.map;
  /** @override {@link Entity#setMap} */
  setMap = (map: MapInstance) => {
    this.map = map;
  };

  /** @override */
  getSprite = (): Sprite | null => this.sprite;

  /** @override */
  isBlocking = (): boolean => {
    switch (this.tileType) {
      case TileType.WALL_HALL:
      case TileType.WALL_TOP:
      case TileType.WALL:
      case TileType.NONE:
        return true;
      default:
        return false;
    }
  };

  /** @override */
  playTurnAction = async () => {};

  getTileType = (): TileType => this.tileType;

  /**
   * @override {@link Entity#getType}
   */
  getType = (): EntityType => EntityType.TILE;
}
