import DynamicSprite from '../graphics/sprites/DynamicSprite';
import Animatable from '../graphics/animations/Animatable';
import Entity from '../types/Entity';
import Coordinates from '../geometry/Coordinates';
import { DoorDirection } from 'src/gen-schema/door-direction.schema';

export type DoorState = 'OPEN' | 'CLOSED';
export namespace DoorState {
  export const values = () => ['OPEN', 'CLOSED'];
}

type Props = Readonly<{
  direction: DoorDirection,
  state: DoorState,
  x: number,
  y: number,
  sprite: DynamicSprite<Door>
}>;

export default class Door implements Entity, Animatable {
  private readonly _direction: DoorDirection;
  private _state: DoorState;
  private x: number;
  private y: number;
  private readonly sprite: DynamicSprite<Door>;

  constructor({ direction, state, x, y, sprite }: Props) {
    this._direction = direction;
    this._state = state;
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    sprite.target = this;
  }

  getCoordinates = (): Coordinates => ({ x: this.x, y: this.y });
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
