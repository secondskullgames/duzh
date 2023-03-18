import Sprite from '../graphics/sprites/Sprite';
import { randChoice } from '../utils/random';
import TileSet from './TileSet';
import { checkNotNull } from '../utils/preconditions';
import TileType from '../schemas/TileType';
import Entity from '../entities/Entity';
import Coordinates from '../geometry/Coordinates';

type Props = Readonly<{
  tileType: TileType,
  tileSet: TileSet,
  coordinates: Coordinates
}>;

class Tile implements Entity {
  private readonly coordinates: Coordinates;
  private readonly tileType: TileType;
  private readonly sprite: Sprite | null;

  constructor({ tileType, tileSet, coordinates }: Props) {
    this.tileType = tileType;
    this.coordinates = coordinates;

    const tilesOfType = checkNotNull(tileSet[tileType]);
    this.sprite = randChoice(tilesOfType);
  }

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;

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
  getType = (): EntityType => 'unit';
}

export default Tile;
