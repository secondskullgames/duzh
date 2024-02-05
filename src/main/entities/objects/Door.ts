import GameObject, { ObjectType } from './GameObject';
import DynamicSprite from '../../graphics/sprites/DynamicSprite';
import Animatable from '../../graphics/animations/Animatable';
import DoorDirection from '../../schemas/DoorDirection';
import Coordinates from '../../geometry/Coordinates';
import MapInstance from '../../maps/MapInstance';

export enum DoorState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export namespace DoorState {
  export const values = (): DoorState[] => [DoorState.OPEN, DoorState.CLOSED];
}

type Props = Readonly<{
  direction: DoorDirection;
  state: DoorState;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: DynamicSprite<Door>;
}>;

export default class Door extends GameObject implements Animatable {
  private readonly _direction: DoorDirection;
  private _state: DoorState;

  constructor({ direction, state, coordinates, map, sprite }: Props) {
    super({
      coordinates,
      map,
      objectType: ObjectType.DOOR,
      sprite
    });
    sprite.bind(this);
    this._direction = direction;
    this._state = state;
  }

  isOpen = () => this._state === DoorState.OPEN;
  isClosed = () => this._state === DoorState.CLOSED;

  open = async () => {
    this._state = DoorState.OPEN;
  };

  close = async () => {
    this._state = DoorState.CLOSED;
  };

  toggleOpen = async () => {
    if (this._state === DoorState.OPEN) {
      await this.close();
    } else {
      await this.open();
    }
  };

  getAnimationKey = () => `${this._direction.toLowerCase()}_${this._state.toLowerCase()}`;

  /** @override {@link Entity#update} */
  playTurnAction = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => this._state === DoorState.CLOSED;
}
