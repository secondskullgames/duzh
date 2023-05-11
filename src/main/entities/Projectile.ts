import Entity from './Entity';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Sprite from '../graphics/sprites/Sprite';
import { EntityType } from './EntityType';

type Props = Readonly<{
  coordinates: Coordinates
  direction: Direction,
  sprite: Sprite
}>;

export default class Projectile implements Entity {
  private coordinates: Coordinates;
  private readonly direction: Direction;
  private readonly sprite: Sprite;

  constructor({ coordinates, direction, sprite }: Props) {
    this.coordinates = coordinates;
    this.direction = direction;
    this.sprite = sprite;
  };

  /** @override {@link Entity#getCoordinates} */
  getCoordinates = (): Coordinates => this.coordinates;

  /**
   * @override {@link Entity#setCoordinates}
   * TODO we don't use this, we recreate the projectile... we should probably just move it
   */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  /** @override {@link Entity#getSprite} */
  getSprite = (): Sprite => this.sprite;

  /** @override {@link Entity#update} */
  update = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;

  /** @override {@link Entity#getType} */
  getType = (): EntityType => EntityType.PROJECTILE;

  getDirection = (): Direction => this.direction;
}
