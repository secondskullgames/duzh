import Unit from '../units/Unit';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import { Faction } from '@main/units/Faction';
import { checkNotNull } from '@lib/utils/preconditions';
import { UnitAbility } from '@main/abilities/UnitAbility';

export const levelUp = (unit: Unit, session: Session) => {
  const ticker = session.getTicker();
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    unit.increaseMaxLife(playerUnitClass.lifePerLevel);
    unit.increaseMaxMana(playerUnitClass.manaPerLevel);
    unit.increaseStrength(playerUnitClass.strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`, {
        turn: session.getTurn()
      });
      unit.awardAbilityPoint();
    } else {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.abilityForName(abilityName));
      }
    }
  }
};
