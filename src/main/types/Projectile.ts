import Entity from './Entity';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Sprite from '../graphics/sprites/Sprite';

type Props = {
  x: number,
  y: number,
  direction: Direction,
  sprite: Sprite
};

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

  getCoordinates = (): Coordinates => ({ x: this.x, y: this.y });
  getDirection = (): Direction => this.direction;
  getSprite = (): Sprite => this.sprite;

  update = async () => {};
}