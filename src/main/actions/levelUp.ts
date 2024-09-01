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
    if (Feature.isEnabled(Feature.SHRINES)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.createAbilityForName(abilityName));
      }
    } else {
      unit.increaseMaxLife(playerUnitClass.lifePerLevel);
      unit.increaseMaxMana(playerUnitClass.manaPerLevel);
      unit.increaseMeleeDamage(playerUnitClass.meleeDamagePerLevel);
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.createAbilityForName(abilityName));
      }
    }
  }
};
