import Unit from '../entities/units/Unit';
import { Feature } from '@main/utils/features';
import { AbilityName } from '@main/entities/units/abilities/AbilityName';
import { Session } from '@main/core/Session';
import { Faction } from '@main/entities/units/Faction';
import { checkNotNull } from '@lib/utils/preconditions';
import { UnitAbility } from '@main/entities/units/abilities/UnitAbility';

export const abilitiesLearnedAtLevel: Record<number, AbilityName> = {
  2: AbilityName.HEAVY_ATTACK,
  3: AbilityName.KNOCKBACK_ATTACK,
  4: AbilityName.STUN_ATTACK,
  5: AbilityName.DASH_ATTACK
};

export const levelUp = (unit: Unit, session: Session) => {
  const ticker = session.getTicker();
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    unit.increaseMaxLife(playerUnitClass.lifePerLevel);
    unit.increaseMaxMana(playerUnitClass.manaPerLevel);
    unit.increaseStrength(playerUnitClass.strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`, {
        turn: session.getTurn()
      });
      unit.awardAbilityPoint();
    } else {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
      const abilityToLearn = abilitiesLearnedAtLevel[unit.getLevel()] ?? null;
      if (abilityToLearn) {
        unit.learnAbility(UnitAbility.abilityForName(abilityToLearn));
      }
    }
  }
};
