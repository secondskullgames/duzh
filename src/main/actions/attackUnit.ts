import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import { logMessage } from './logMessage';
import { die } from './die';
import { recordKill } from './recordKill';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Activity from '../entities/units/Activity';
import { sleep } from '../utils/promises';
import { EquipmentScript } from '../equipment/EquipmentScript';
import { SoundEffect } from '../sounds/types';

type Props = Readonly<{
  attacker: Unit,
  defender: Unit,
  getDamage: (unit: Unit) => number,
  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number) => string,
  sound: SoundEffect
}>;

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export const attackUnit = async (
  { attacker, defender, getDamage, getDamageLogMessage, sound }: Props,
  { state, imageFactory }: Context
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).onAttack?.(
        equipment,
        defender.getCoordinates(),
        { state, imageFactory }
      );
    }
  }

  // attacking frame
  attacker.setActivity(Activity.ATTACKING, 1, attacker.getDirection());

  await sleep(50);

  // damaged frame
  defender.setActivity(Activity.DAMAGED, 1, defender.getDirection());

  const damage = getDamage(attacker);
  const adjustedDamage = defender.takeDamage(damage, attacker);
  attacker.recordDamageDealt(adjustedDamage);
  playSound(sound);
  const message = getDamageLogMessage(attacker, defender, adjustedDamage);
  logMessage(message, { state });

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, { state, imageFactory });
    recordKill(attacker, { state });
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());

  await sleep(50);
};