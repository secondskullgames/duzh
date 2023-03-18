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
  private x: number;
  private y: number;
  private direction: Direction;
  private sprite: Sprite;

  constructor({ x, y, direction, sprite }: Props) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.sprite = sprite;
  };

  /** @override */
  getCoordinates = (): Coordinates => ({ x: this.x, y: this.y });

  getDirection = (): Direction => this.direction;

  /** @override */
  getSprite = (): Sprite => this.sprite;

  /** @override */
  update = async () => {};

  /** @override */
  isBlocking = (): boolean => false;
}
