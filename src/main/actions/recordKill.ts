import Unit from '../entities/units/Unit';
import { levelUp } from './levelUp';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';

type Context = Readonly<{
  state: GameState
}>;

/**
 * @param unit the unit who performed the kill
 */
export const recordKill = (unit: Unit, { state }: Context) => {
  unit.recordKill();
  const killsToNextLevel = unit.getKillsToNextLevel();
  if (killsToNextLevel !== null) {
    if (unit.getLifetimeKills() >= killsToNextLevel) {
      levelUp(unit, { state });
      playSound(Sounds.LEVEL_UP);
    }
  }
};