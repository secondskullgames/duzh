import Unit from '../entities/units/Unit';
import { Feature } from '@main/utils/features';
import { AbilityName } from '@main/entities/units/abilities/AbilityName';
import { Session } from '@main/core/Session';
import { Faction } from '@main/entities/units/Faction';
import { checkNotNull } from '@main/utils/preconditions';
import { UnitAbility } from '@main/entities/units/abilities/UnitAbility';
import { GameState } from '@main/core/GameState';
import { EventType } from '@main/core/EventLog';

export const levelUp = (unit: Unit, state: GameState, session: Session) => {
  const eventLog = state.getEventLog();
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    unit.increaseMaxLife(playerUnitClass.lifePerLevel);
    unit.increaseMaxMana(playerUnitClass.manaPerLevel);
    unit.increaseStrength(playerUnitClass.strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      state.getEventLog().log({
        type: EventType.LEVELED_UP,
        message: `Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`,
        sessionId: session.id,
        turn: session.getTurn(),
        timestamp: new Date()
      });
      unit.awardAbilityPoint();
    } else {
      state.getEventLog().log({
        type: EventType.LEVELED_UP,
        message: `Welcome to level ${unit.getLevel()}!`,
        sessionId: session.id,
        turn: session.getTurn(),
        timestamp: new Date()
      });
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
