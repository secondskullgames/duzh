import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { logMessage } from './logMessage';
import { die } from './die';
import { recordKill } from './recordKill';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Activity from '../entities/units/Activity';
import { MEDIUM_SLEEP, SHORT_SLEEP, sleep } from '../utils/promises';
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
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const attackUnit = async (
  { attacker, defender, getDamage, getDamageLogMessage, sound }: Props,
  { state, renderer, imageFactory }: Context
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).onAttack?.(
        equipment,
        defender.getCoordinates(),
        { state, renderer, imageFactory }
      );
    }
  }

  // attacking frame
  attacker.setActivity(Activity.ATTACKING, 1, attacker.getDirection());
  await renderer.render();

  await sleep(SHORT_SLEEP);

  // damaged frame
  defender.setActivity(Activity.DAMAGED, 1, defender.getDirection());
  await renderer.render();

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

  await sleep(SHORT_SLEEP);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());
  await sleep(SHORT_SLEEP);
};