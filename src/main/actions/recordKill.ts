import { levelUp } from './levelUp';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { Session } from '../core/Session';

export const recordKill = (attacker: Unit, defender: Unit, session: Session) => {
  const experience = defender.getExperienceRewarded();
  if (!experience || experience <= 0) {
    return;
  }

  attacker.gainExperience(experience);

  const playerUnitClass = attacker.getPlayerUnitClass();
  if (playerUnitClass) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const killsToNextLevel = playerUnitClass.getCumulativeKillsToNextLevel(
        attacker.getLevel()
      );
      if (killsToNextLevel !== null && attacker.getLifetimeKills() >= killsToNextLevel) {
        levelUp(attacker, session);
        playSound(Sounds.LEVEL_UP);
      } else {
        break;
      }
    }
  }
};
