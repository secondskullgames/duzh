import Unit from '../entities/units/Unit';
import { levelUp } from './levelUp';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GlobalContext } from '../core/GlobalContext';

/**
 * @param unit the unit who performed the kill
 */
export const recordKill = (unit: Unit, context: GlobalContext) => {
  unit.recordKill();
  const killsToNextLevel = unit.getKillsToNextLevel();
  if (killsToNextLevel !== null) {
    if (unit.getLifetimeKills() >= killsToNextLevel) {
      levelUp(unit, context);
      playSound(Sounds.LEVEL_UP);
    }
  }
};