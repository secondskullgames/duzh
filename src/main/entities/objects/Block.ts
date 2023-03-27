import GameObject from './GameObject';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';
import GameState from '../../core/GameState';

type Props = Readonly<{
  coordinates: Coordinates,
  sprite: Sprite,
  movable: boolean
}>;

export default class Block extends GameObject {
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

  moveTo = async ({ x, y }: Coordinates) => {
    const state = GameState.getInstance();
    const map = state.getMap();
    map.removeObject(this);

    this.setCoordinates({ x, y });
    map.addObject(this);
  };
}
