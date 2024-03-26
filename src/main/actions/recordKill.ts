import { levelUp } from './levelUp';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { GameState } from '@main/core/GameState';

export const recordKill = (attacker: Unit, defender: Unit, state: GameState) => {
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
        levelUp(attacker, state);
        state.getSoundPlayer().playSound(Sounds.LEVEL_UP);
      } else {
        break;
      }
    }
  }
};
