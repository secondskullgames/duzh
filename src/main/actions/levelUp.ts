import Unit from '../units/Unit';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import { Faction } from '@main/units/Faction';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';

export const levelUp = (unit: Unit, state: GameState, session: Session) => {
  const ticker = session.getTicker();
  const abilityFactory = state.getAbilityFactory();
  unit.incrementLevel();

  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    if (Feature.isEnabled(Feature.SHRINES)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(abilityFactory.abilityForName(abilityName));
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
        unit.learnAbility(abilityFactory.abilityForName(abilityName));
      }
    }
  }
};
