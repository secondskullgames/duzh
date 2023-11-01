import Sprite from '../graphics/sprites/Sprite';
import TileType from '../schemas/TileType';
import Entity from '../entities/Entity';
import Coordinates from '../geometry/Coordinates';
import { EntityType } from '../entities/EntityType';

type Props = Readonly<{
  tileType: TileType;
  sprite: Sprite | null;
  coordinates: Coordinates;
}>;

export default class Tile implements Entity {
  private coordinates: Coordinates;
  private readonly tileType: TileType;
  private readonly sprite: Sprite | null;

  constructor({ tileType, sprite, coordinates }: Props) {
    this.tileType = tileType;
    this.coordinates = coordinates;
    this.sprite = sprite;
  }

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;
  /** @override {@link Entity#setCoordinates} */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
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
  update = async () => {};

  getTileType = (): TileType => this.tileType;

  /**
   * @override {@link Entity#getType}
   */
  getType = (): EntityType => EntityType.TILE;
}
