import Unit from '../units/Unit';
import { Feature } from '@main/utils/features';
import { Faction } from '@main/units/Faction';
import { checkNotNull } from '@lib/utils/preconditions';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Globals } from '@main/core/globals';

export const levelUp = (unit: Unit) => {
  const { ticker } = Globals;
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    if (Feature.isEnabled(Feature.SHRINES)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!`);
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
      ticker.log(`Welcome to level ${unit.getLevel()}!`);
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.createAbilityForName(abilityName));
      }
    }
  }
};
