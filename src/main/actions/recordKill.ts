import { levelUp } from './levelUp';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

/**
 * @param unit the unit who performed the kill
 */
export const recordKill = (unit: Unit, { state, session }: Context) => {
  unit.recordKill();
  const killsToNextLevel = unit.getKillsToNextLevel();
  if (killsToNextLevel !== null) {
    if (unit.getLifetimeKills() >= killsToNextLevel) {
      levelUp(unit, { session, state });
      playSound(Sounds.LEVEL_UP);
    }
  }
};
