import Entity from '../entities/Entity';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Sprite from '../graphics/sprites/Sprite';

type Props = Readonly<{
  x: number,
  y: number,
  direction: Direction,
  sprite: Sprite
}>;

export default class Projectile implements Entity {
  private coordinates: Coordinates
  private direction: Direction;
  private sprite: Sprite;

  constructor({ x, y, direction, sprite }: Props) {
    this.coordinates = { x, y };
    this.direction = direction;
    this.sprite = sprite;
  };

  /** @override {@link Entity#getCoordinates} */
  getCoordinates = (): Coordinates => this.coordinates;

  /** @override {@link Entity#getSprite} */
  getSprite = (): Sprite => this.sprite;

  /** @override {@link Entity#update} */
  update = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;

  /** @override {@link Entity#getType} */
  getType = (): EntityType => 'projectile';

  getDirection = (): Direction => this.direction;
}
