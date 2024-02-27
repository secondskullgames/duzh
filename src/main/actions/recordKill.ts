import { levelUp } from './levelUp';
import Sounds from '../sounds/Sounds';
import { Session, GameState } from '@main/core';
import { Unit } from '@main/entities/units';

export const recordKill = (
  attacker: Unit,
  defender: Unit,
  session: Session,
  state: GameState
) => {
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
        state.getSoundPlayer().playSound(Sounds.LEVEL_UP);
      } else {
        break;
      }
    }
  }
};
