import Unit from '../entities/units/Unit';

const lifePerLevel = 0;
const manaPerLevel = 2;
const damagePerLevel = 0;

export const levelUp = (unit: Unit) => {
  unit.incrementLevel();
  unit.incrementMaxLife(lifePerLevel);
  unit.incrementMaxMana(manaPerLevel);
  unit.incrementDamage(damagePerLevel);
  unit.awardAbilityPoint();
};