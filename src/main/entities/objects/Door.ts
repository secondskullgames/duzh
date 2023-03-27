import DynamicSprite from '../../graphics/sprites/DynamicSprite';
import Animatable from '../../graphics/animations/Animatable';
import DoorDirection from '../../schemas/DoorDirection';
import GameObject from './GameObject';
import Coordinates from '../../geometry/Coordinates';

export type DoorState = 'OPEN' | 'CLOSED';
export namespace DoorState {
  export const values = () => ['OPEN', 'CLOSED'];
}

type Props = Readonly<{
  direction: DoorDirection,
  state: DoorState,
  coordinates: Coordinates,
  sprite: DynamicSprite<Door>
}>;

export default class Door extends GameObject implements Animatable {
  private readonly _direction: DoorDirection;
  private _state: DoorState;

  constructor({ direction, state, coordinates, sprite }: Props) {
    super({
      coordinates,
      objectType: 'door',
      sprite
    });
    sprite.target = this;
    this._direction = direction;
    this._state = state;
  }

  isOpen = () => this._state === 'OPEN';
  isClosed = () => this._state === 'CLOSED';

  open = async () => {
    this._state = 'OPEN';
  };

  close = async () => {
    this._state = 'CLOSED';
  };

  toggleOpen = async () => {
    if (this._state === 'OPEN') {
      await this.close();
    } else {
      await this.open();
    }
  };

  getAnimationKey = () => `${this._direction.toLowerCase()}_${this._state.toLowerCase()}`;

  /** @override {@link Entity#update} */
  update = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => this._state === 'CLOSED';
}
