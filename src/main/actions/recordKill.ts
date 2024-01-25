import { levelUp } from './levelUp';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { Session } from '../core/Session';

/**
 * @param unit the unit who performed the kill
 */
export const recordKill = (unit: Unit, session: Session) => {
  unit.recordKill();

  const playerUnitClass = unit.getPlayerUnitClass();
  if (playerUnitClass) {
    const killsToNextLevel = playerUnitClass.getCumulativeKillsToNextLevel(
      unit.getLevel()
    );
    if (killsToNextLevel !== null) {
      if (unit.getLifetimeKills() >= killsToNextLevel) {
        levelUp(unit, session);
        playSound(Sounds.LEVEL_UP);
      }
    }
  }
};
