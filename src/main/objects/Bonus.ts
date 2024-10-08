import GameObject, { ObjectType } from './GameObject';
import Unit from '../units/Unit';
import Sprite from '@main/graphics/sprites/Sprite';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  onUse: (unit: Unit, state: GameState, session: Session) => Promise<void>;
}>;

export default class Bonus extends GameObject {
  readonly onUse: (unit: Unit, state: GameState, session: Session) => Promise<void>;

  constructor({ name, coordinates, map, sprite, onUse }: Props) {
    super({
      name,
      coordinates,
      objectType: ObjectType.BONUS,
      sprite,
      map
    });
    this.onUse = onUse;
  }

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;
}
