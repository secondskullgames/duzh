import Unit from '../entities/units/Unit';
import { Faction } from '../types/types';
import GameState from '../core/GameState';
import { logMessage } from './logMessage';
import { Feature } from '../utils/features';
import { abilityForName } from '../entities/units/abilities/abilityForName';
import { AbilityName } from '../entities/units/abilities/AbilityName';

const lifePerLevel = 0;
const manaPerLevel = 3;
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

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      logMessage(`Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`, { state });
      unit.awardAbilityPoint();
    } else {
      logMessage(`Welcome to level ${unit.getLevel()}!`, { state });
      switch (unit.getLevel()) {
        case 2:
          unit.learnAbility(abilityForName(AbilityName.HEAVY_ATTACK));
          break;
        case 3:
          unit.learnAbility(abilityForName(AbilityName.KNOCKBACK_ATTACK));
          break;
        case 4:
          unit.learnAbility(abilityForName(AbilityName.STUN_ATTACK));
          break;
        case 5:
          unit.learnAbility(abilityForName(AbilityName.BLINK));
          break;
      }
    }
  }
};