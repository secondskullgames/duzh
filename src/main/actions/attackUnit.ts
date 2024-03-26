import { die } from './die';
import { recordKill } from './recordKill';
import Unit, { DefendResult } from '../units/Unit';
import Activity from '../units/Activity';
import { GameState } from '@main/core/GameState';
import { sleep } from '@lib/utils/promises';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { SoundEffect } from '@lib/audio/types';
import { Session } from '@main/core/Session';
import { StatusEffect } from '@main/units/effects/StatusEffect';

export type AttackResult = Readonly<{
  /** the "outgoing", pre-mitigation damage */
  damage: number;
}>;

export type Attack = Readonly<{
  calculateAttackResult: (attacker: Unit) => AttackResult;
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult) => string;
  sound: SoundEffect;
}>;

export const attackUnit = async (
  attacker: Unit,
  defender: Unit,
  attack: Attack,
  session: Session,
  state: GameState
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).beforeAttack?.(
        equipment,
        defender.getCoordinates(),
        state,
        session
      );
    }
  }

  // attacking frame
  attacker.setActivity(Activity.ATTACKING, 1, attacker.getDirection());

  await sleep(50);

  // damaged frame
  defender.getEffects().addEffect(StatusEffect.DAMAGED, 1);

  const attackResult = attack.calculateAttackResult(attacker);
  const defendResult = defender.takeDamage(attackResult.damage, attacker);
  attacker.recordDamageDealt(defendResult.damageTaken);
  state.getSoundPlayer().playSound(attack.sound);
  const message = attack.getDamageLogMessage(attacker, defender, defendResult);
  state.ticker.log(message, state);

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, state, session);
    recordKill(attacker, defender, state);
  }

  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).afterAttack?.(
        equipment,
        defender.getCoordinates(),
        state,
        session
      );
    }
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());
  defender.getEffects().removeEffect(StatusEffect.DAMAGED);
};
