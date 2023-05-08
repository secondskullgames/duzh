import Unit from '../entities/units/Unit';
import { AbilityName } from '../entities/units/abilities/UnitAbility';
import { abilityForName } from '../entities/units/abilities/abilityForName';

const lifePerLevel = 0;
const manaPerLevel = 2;
const damagePerLevel = 0;

export const levelUp = (unit: Unit) => {
  unit.incrementLevel();
  unit.incrementMaxLife(lifePerLevel);
  unit.incrementMaxMana(manaPerLevel);
  unit.incrementDamage(damagePerLevel);
  const abilities = unit.getNewAbilities(unit.getLevel());
  for (const abilityName of abilities) {
    const ability = abilityForName(abilityName as AbilityName);
    unit.addAbility(ability);
  }
};