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
  readonly char: string;
  x: number;
  y: number;
  sprite: Sprite;

  constructor({ direction, state, x, y, sprite }: Props) {
    this._direction = direction;
    this._state = state;
    this.char = _getChar(direction, state);
    this.x = x;
    this.y = y;
  }

  isOpen = () => this._state === 'OPEN';

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

const _getChar = (direction: Direction, state: State): string => {
  switch (direction) {
    case 'VERTICAL': return (state === 'OPEN') ? ' ' : '-';
    case 'HORIZONTAL': return (state === 'OPEN') ? ' ' : '|';
  }
};

export default Door;
export {
  Direction as DoorDirection,
  State as DoorState
};
