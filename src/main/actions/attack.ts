import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { dealDamage } from './dealDamage';
import { logMessage } from './logMessage';
import { die } from './die';
import { awardExperience } from './awardExperience';
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
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const attack = async (
  { attacker, defender, getDamage, getDamageLogMessage, sound }: Props,
  { state, renderer, imageFactory }: Context
) => {
  const playerUnit = state.getPlayerUnit();

  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).onAttack?.(
        equipment,
        defender.getCoordinates(),
        { state, renderer, imageFactory }
      );
    }
  }

  // damaged frame
  attacker.setActivity(Activity.ATTACKING, 1, attacker.getDirection());
  defender.setActivity(Activity.DAMAGED, 1, defender.getDirection());
  await renderer.render();

  const damage = getDamage(attacker);
  const adjustedDamage = defender.takeDamage(damage, attacker);
  playSound(sound);

  const message = getDamageLogMessage(attacker, defender, adjustedDamage);
  logMessage(message, { state });

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, { state });
    if (attacker === playerUnit) {
      awardExperience(attacker, 1);
    }
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());
};