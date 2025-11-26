import GameObject, { ObjectType } from './GameObject';
import DynamicSprite from '@main/graphics/sprites/DynamicSprite';
import MapInstance from '@main/maps/MapInstance';
import { DoorDirection } from '@duzh/models';
import { Coordinates } from '@duzh/geometry';
import { checkState } from '@duzh/utils/preconditions';

export enum DoorState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export namespace DoorState {
  export const values = (): DoorState[] => [DoorState.OPEN, DoorState.CLOSED];
}

type Props = Readonly<{
  name: string;
  direction: DoorDirection;
  state: DoorState;
  locked: boolean;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: DynamicSprite<Door>;
}>;

export default class Door extends GameObject {
  private readonly _direction: DoorDirection;
  private _state: DoorState;
  private _locked: boolean;

  constructor({ name, direction, state, locked, coordinates, map, sprite }: Props) {
    super({
      name,
      coordinates,
      map,
      objectType: ObjectType.DOOR,
      sprite
    });
    sprite.bind(this);
    this._direction = direction;
    this._state = state;
    this._locked = locked;
  }

  isOpen = (): boolean => this._state === DoorState.OPEN;
  isClosed = (): boolean => this._state === DoorState.CLOSED;
  isLocked = (): boolean => this._locked;

  unlock = () => {
    this._locked = false;
  };

  open = () => {
    checkState(!this._locked);
    this._state = DoorState.OPEN;
  };

  close = () => {
    this._state = DoorState.CLOSED;
  };

  toggleOpen = () => {
    if (this._state === DoorState.OPEN) {
      this.close();
    } else {
      this.open();
    }
  };

  getDirection = (): DoorDirection => this._direction;
  getState = (): DoorState => this._state;

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => this.isClosed();
}
