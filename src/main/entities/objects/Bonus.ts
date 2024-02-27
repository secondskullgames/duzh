import GameObject, { ObjectType } from './GameObject';
import MapInstance from '../../maps/MapInstance';
import { Sprite } from '@main/graphics/sprites';
import { GameState, Session } from '@main/core';
import { Coordinates } from '@main/geometry';
import { Unit } from '@main/entities/units';

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
