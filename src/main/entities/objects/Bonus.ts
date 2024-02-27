import GameObject, { ObjectType } from './GameObject';
import Unit from '../units/Unit';
import MapInstance from '../../maps/MapInstance';
import { Sprite } from '@main/graphics/sprites';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { Coordinates } from '@main/geometry';

type Props = Readonly<{
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  onUse: (unit: Unit, state: GameState, session: Session) => Promise<void>;
}>;

export default class Bonus extends GameObject {
  readonly onUse: (unit: Unit, state: GameState, session: Session) => Promise<void>;

  constructor({ coordinates, map, sprite, onUse }: Props) {
    super({
      coordinates,
      objectType: ObjectType.BONUS,
      sprite,
      map
    });
    this.onUse = onUse;
  }

  /** @override {@link Entity#update} */
  playTurnAction = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;
}
