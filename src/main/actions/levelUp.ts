import Unit from '../entities/units/Unit';
import PlayerUnitController from '../entities/units/controllers/PlayerUnitController';
import { Faction } from '../types/types';

const lifePerLevel = 0;
const manaPerLevel = 5;
const damagePerLevel = 0;

export const levelUp = (unit: Unit) => {
  unit.incrementLevel();
  // TODO - maybe these should go in player.json (again?)
  if (unit.getFaction() === Faction.PLAYER) {
    unit.increaseMaxLife(lifePerLevel);
    unit.increaseMaxMana(manaPerLevel);
    unit.incrementDamage(damagePerLevel);
  }
  unit.awardAbilityPoint();
};