import Sprite from '../graphics/sprites/Sprite';
import TileType from '../schemas/TileType';
import Entity from '../entities/Entity';
import Coordinates from '../geometry/Coordinates';
import MapInstance from '../maps/MapInstance';
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
      case 'WALL_HALL':
      case 'WALL_TOP':
      case 'WALL':
      case 'NONE':
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
