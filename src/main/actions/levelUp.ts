import Unit from '../entities/units/Unit';
import { Feature } from '@main/utils/features';
import { AbilityName } from '@main/entities/units/abilities/AbilityName';
import { Session } from '@main/core/Session';
import { Faction } from '@main/entities/units/Faction';
import { checkNotNull } from '@main/utils/preconditions';
import { UnitAbility } from '@main/entities/units/abilities/UnitAbility';
import { GameState } from '@main/core/GameState';

export const levelUp = (unit: Unit, state: GameState, session: Session) => {
  const eventLog = state.getEventLog();
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    unit.increaseMaxLife(playerUnitClass.lifePerLevel);
    unit.increaseMaxMana(playerUnitClass.manaPerLevel);
    unit.increaseStrength(playerUnitClass.strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      eventLog.log(
        `Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`,
        session
      );
      unit.awardAbilityPoint();
    } else {
      eventLog.log(`Welcome to level ${unit.getLevel()}!`, session);
      switch (unit.getLevel()) {
        case 2:
          unit.learnAbility(UnitAbility.abilityForName(AbilityName.HEAVY_ATTACK));
          break;
        case 3:
          unit.learnAbility(UnitAbility.abilityForName(AbilityName.KNOCKBACK_ATTACK));
          break;
        case 4:
          unit.learnAbility(UnitAbility.abilityForName(AbilityName.STUN_ATTACK));
          break;
        case 5:
          unit.learnAbility(UnitAbility.abilityForName(AbilityName.BLINK));
          break;
      }
    }
  }
};
