import Entity from '../Entity';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';

type ObjectType = 'spawner' | 'door' | 'item' | 'block';

type Props = Readonly<{
  coordinates: Coordinates,
  objectType: ObjectType,
  sprite: Sprite
}>;

abstract class Object implements Entity {
  private coordinates: Coordinates;
  private readonly objectType: ObjectType;
  private readonly sprite: Sprite | null;

  protected constructor({ coordinates, objectType, sprite }: Props) {
    this.coordinates = coordinates;
    this.objectType = objectType;
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

  /** @override */
  getObjectType = (): ObjectType => this.objectType;
}

export default Object;