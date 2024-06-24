import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { UnitApi } from '@main/units/UnitApi';

export const recordKill = async (
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
        await UnitApi.levelUp(attacker, session);
        state.getSoundPlayer().playSound(Sounds.LEVEL_UP);
      } else {
        break;
      }
    }
  }
};
