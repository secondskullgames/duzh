import { die } from './die';
import { recordKill } from './recordKill';
import Unit, { DefendResult } from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import { GameState } from '../core/GameState';
import Activity from '../entities/units/Activity';
import { sleep } from '../utils/promises';
import { EquipmentScript } from '../equipment/EquipmentScript';
import { SoundEffect } from '../sounds/types';
import { Session } from '../core/Session';

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
      await EquipmentScript.forName(equipment.script).onAttack?.(
        equipment,
        defender.getCoordinates(),
        { state, session }
      );
    }
  }

  // attacking frame
  attacker.setActivity(Activity.ATTACKING, 1, attacker.getDirection());

  await sleep(50);

  // damaged frame
  defender.setActivity(Activity.DAMAGED, 1, defender.getDirection());

  const attackResult = attack.calculateAttackResult(attacker);
  const defendResult = defender.takeDamage(attackResult.damage, attacker);
  attacker.recordDamageDealt(defendResult.damageTaken);
  playSound(attack.sound);
  const message = attack.getDamageLogMessage(attacker, defender, defendResult);
  session.getTicker().log(message, { turn: session.getTurn() });

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, { map: session.getMap(), session });
    recordKill(attacker, defender, session);
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());

  await sleep(50);
};
