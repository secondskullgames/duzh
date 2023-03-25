import Object from './Object';
import StaticSprite from '../../graphics/sprites/StaticSprite';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';

type Props = Readonly<{
  coordinates: Coordinates,
  sprite: Sprite,
  movable: boolean
}>;

export default class Block extends Object {
  private readonly movable: boolean;

  constructor({ coordinates, sprite, movable }: Props) {
    super({
      coordinates,
      objectType: 'block',
      sprite
    });
    this.movable = movable;
  }

  /** @override {@link Entity#update} */
  update = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => true;

  isMovable = (): boolean => this.movable;
}
