import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { Entity } from '../types/types';

type Direction = 'HORIZONTAL' | 'VERTICAL';
type State = 'OPEN' | 'CLOSED';

type Props = {
  direction: Direction,
  state: State,
  x: number,
  y: number,
  sprite: Sprite
};

class Door implements Entity {
  private readonly _direction: Direction;
  private _state: State;
  x: number;
  y: number;
  sprite: Sprite;

  constructor({ direction, state, x, y, sprite }: Props) {
    this._direction = direction;
    this._state = state;
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }

  isOpen = () => this._state === 'OPEN';
  isClosed = () => this._state === 'CLOSED';

  open = async () => {
    this._state = 'OPEN';
    this.sprite = await SpriteFactory.createDoorSprite(this._direction, this._state);
  };
  close = async () => {
    this._state = 'CLOSED';
    this.sprite = await SpriteFactory.createDoorSprite(this._direction, this._state);
  };
  toggleOpen = async () => {
    if (this._state === 'OPEN') {
      await this.close();
    } else {
      await this.open();
    }
  };
}

export default Door;
export {
  Direction as DoorDirection,
  State as DoorState
};
