import Unit from '../entities/units/Unit';
import { Feature } from '../utils/features';
import { abilityForName } from '../entities/units/abilities/abilityForName';
import { AbilityName } from '../entities/units/abilities/AbilityName';
import { Session } from '../core/Session';
import { Faction } from '../entities/units/Faction';
import { checkNotNull } from '../utils/preconditions';

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
