import Entity from '../Entity';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';
import { EntityType } from '../EntityType';

type ObjectType = 'spawner' | 'door' | 'item' | 'block';

type Props = Readonly<{
  coordinates: Coordinates,
  objectType: ObjectType,
  sprite: Sprite
}>;

export default abstract class GameObject implements Entity {
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
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  /** @override */
  getSprite = (): Sprite | null => this.sprite;

  /** @override */
  getType = (): EntityType => EntityType.OBJECT;

  /** @override */
  abstract update: () => Promise<void>;
  /** @override */
  abstract isBlocking: () => boolean;

  /** @override */
  getObjectType = (): ObjectType => this.objectType;
}