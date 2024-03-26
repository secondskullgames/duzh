import Unit from '../units/Unit';
import { Feature } from '@main/utils/features';
import { Faction } from '@main/units/Faction';
import { checkNotNull } from '@lib/utils/preconditions';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { GameState } from '@main/core/GameState';

export const levelUp = (unit: Unit, state: GameState) => {
  const ticker = state.ticker;
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    unit.increaseMaxLife(playerUnitClass.lifePerLevel);
    unit.increaseMaxMana(playerUnitClass.manaPerLevel);
    unit.increaseStrength(playerUnitClass.strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      ticker.log(
        `Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`,
        state
      );
      unit.awardAbilityPoint();
    } else {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, state);
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.abilityForName(abilityName));
      }
    }
  }
};
