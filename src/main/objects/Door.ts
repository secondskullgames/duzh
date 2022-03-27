import DynamicSprite from '../graphics/sprites/DynamicSprite';
import Animatable from '../graphics/animations/Animatable';
import { Entity } from '../types/types';

type DoorDirection = 'HORIZONTAL' | 'VERTICAL';
namespace DoorDirection {
  export const values = () => ['HORIZONTAL', 'VERTICAL'];
}
type DoorState = 'OPEN' | 'CLOSED';
namespace DoorState {
  export const values = () => ['OPEN', 'CLOSED'];
}

type Props = {
  direction: DoorDirection,
  state: DoorState,
  x: number,
  y: number,
  sprite: DynamicSprite<Door>
};

class Door implements Entity, Animatable {
  private readonly _direction: DoorDirection;
  private _state: DoorState;
  x: number;
  y: number;
  private readonly sprite: DynamicSprite<Door>;

  constructor({ direction, state, x, y, sprite }: Props) {
    this._direction = direction;
    this._state = state;
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    sprite.target = this;
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
  getSprite = () => this.sprite;

  getAnimationKey = () => `${this._direction.toLowerCase()}_${this._state.toLowerCase()}`;

  update = async () => {};
}

export default Door;
export {
  DoorDirection,
  DoorState
};
