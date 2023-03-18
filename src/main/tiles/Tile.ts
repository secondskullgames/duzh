import Sprite from '../graphics/sprites/Sprite';
import { randChoice } from '../utils/random';
import TileSet from './TileSet';
import { checkNotNull } from '../utils/preconditions';
import TileType from '../schemas/TileType';
import Entity from '../entities/Entity';
import Coordinates from '../geometry/Coordinates';

type Props = Readonly<{
  type: TileType,
  tileSet: TileSet,
  coordinates: Coordinates
}>;

class Tile implements Entity {
  private readonly coordinates: Coordinates;
  private readonly type: TileType;
  private readonly sprite: Sprite | null;

  constructor({ type, tileSet, coordinates }: Props) {
    this.type = type;
    this.coordinates = coordinates;

    const tilesOfType = checkNotNull(tileSet[type]);
    this.sprite = randChoice(tilesOfType);
  }

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;

  /** @override */
  getSprite = (): Sprite | null => this.sprite;

  /** @override */
  isBlocking = (): boolean => {
    switch (this.type) {
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

  getType = (): TileType => this.type;
}

export default Tile;
