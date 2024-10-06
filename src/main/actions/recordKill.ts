import { levelUp } from './levelUp';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Globals } from '@main/core/globals';

export const recordKill = (attacker: Unit, defender: Unit) => {
  const { session, soundPlayer } = Globals;
  const experience = defender.getExperienceRewarded();
  if (!experience || experience <= 0) {
    return;
  }

  attacker.gainExperience(experience);

  const playerUnitClass = attacker.getPlayerUnitClass();
  if (playerUnitClass) {
    while (true) {
      const killsToNextLevel = playerUnitClass.getCumulativeKillsToNextLevel(
        attacker.getLevel()
      );
      if (killsToNextLevel !== null && attacker.getLifetimeKills() >= killsToNextLevel) {
        levelUp(attacker, session);
        soundPlayer.playSound(Sounds.LEVEL_UP);
      } else {
        break;
      }
    }
  }
};
