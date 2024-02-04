import GameObject, { ObjectType } from './GameObject';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';
import Unit from '../units/Unit';
import { GameState } from '../../core/GameState';
import { Session } from '../../core/Session';

type Props = Readonly<{
  coordinates: Coordinates;
  sprite: Sprite;
  onUse: (unit: Unit, state: GameState, session: Session) => Promise<void>;
}>;

export default class Bonus extends GameObject {
  readonly onUse: (unit: Unit, state: GameState, session: Session) => Promise<void>;

  constructor({ coordinates, sprite, onUse }: Props) {
    super({
      coordinates,
      objectType: ObjectType.BONUS,
      sprite
    });
    this.onUse = onUse;
  }

  /** @override {@link Entity#update} */
  playTurnAction = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;
}
