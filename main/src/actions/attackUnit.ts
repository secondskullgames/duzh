import { sleep } from '@main/utils/promises';
import { Game } from '@main/core/Game';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { Activity } from '../units/Activity';
import Unit, { DefendResult } from '../units/Unit';
import { die } from './die';
import { recordKill } from './recordKill';
import { SoundName } from '@main/sounds/SoundName';

export type AttackResult = Readonly<{
  /** the "outgoing", pre-mitigation damage */
  damage: number;
}>;

export type Attack = Readonly<{
  calculateAttackResult: (attacker: Unit) => AttackResult;
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult) => string;
  sound: SoundName;
}>;

export const attackUnit = async (
  attacker: Unit,
  defender: Unit,
  attack: Attack,
  game: Game
) => {
  const { soundController, state, ticker } = game;
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).beforeAttack?.(
        equipment,
        defender.getCoordinates(),
        game
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
  soundController.playSound(attack.sound);
  const message = attack.getDamageLogMessage(attacker, defender, defendResult);
  ticker.log(message, { turn: state.getTurn() });

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, game);
    recordKill(attacker, defender, game);
  }

  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).afterAttack?.(
        equipment,
        defender.getCoordinates(),
        game
      );
    }
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());
  defender.getEffects().removeEffect(StatusEffect.DAMAGED);
};
