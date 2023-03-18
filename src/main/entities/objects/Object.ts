import Entity from '../Entity';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';

type Props = Readonly<{
  coordinates: Coordinates,
  sprite: Sprite
}>;

abstract class Object implements Entity {
  private coordinates: Coordinates;
  private readonly sprite: Sprite | null;

  protected constructor({ coordinates, sprite }: Props) {
    this.coordinates = coordinates;
    this.sprite = sprite;
  }

  /** @override */
  getCoordinates = (): Coordinates  => this.coordinates;

  /** @override */
  getSprite = (): Sprite | null => this.sprite;

  /** @override */
  getType = (): EntityType => 'object';

  /** @override */
  abstract update: () => Promise<void>;
  /** @override */
  abstract isBlocking: () => boolean;
}

export default Object;