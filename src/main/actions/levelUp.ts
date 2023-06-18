import Unit from '../entities/units/Unit';
import { Faction } from '../types/types';
import GameState from '../core/GameState';
import { logMessage } from './logMessage';

const lifePerLevel = 0;
const manaPerLevel = 5;
const damagePerLevel = 0;

type Context = Readonly<{
  state: GameState
}>;

export const levelUp = (unit: Unit, { state }: Context) => {
  unit.incrementLevel();
  // TODO - maybe these should go in player.json (again?)
  if (unit.getFaction() === Faction.PLAYER) {
    unit.increaseMaxLife(lifePerLevel);
    unit.increaseMaxMana(manaPerLevel);
    unit.incrementDamage(damagePerLevel);
    logMessage(`Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`, { state });
  }
  unit.awardAbilityPoint();
};