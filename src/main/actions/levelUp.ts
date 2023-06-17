import Unit from '../entities/units/Unit';

const lifePerLevel = 0;
const manaPerLevel = 5;
const damagePerLevel = 0;

export const levelUp = (unit: Unit) => {
  unit.incrementLevel();
  unit.increaseMaxLife(lifePerLevel);
  unit.increaseMaxMana(manaPerLevel);
  unit.incrementDamage(damagePerLevel);
  unit.awardAbilityPoint();
};