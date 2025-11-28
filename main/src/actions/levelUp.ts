import { Feature } from '@duzh/features';
import { checkNotNull } from '@duzh/utils/preconditions';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Game } from '@main/core/Game';
import { Faction } from '@main/units/Faction';
import Unit from '../units/Unit';

export const levelUp = (unit: Unit, game: Game) => {
  const { state, ticker } = game;
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    if (Feature.isEnabled('shrines')) {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: state.getTurn() });
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
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: state.getTurn() });
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.createAbilityForName(abilityName));
      }
    }
  }
};
