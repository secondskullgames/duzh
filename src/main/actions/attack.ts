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

type Context = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const attack = async (
  attacker: Unit,
  defender: Unit,
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

  const damage = attacker.getDamage();
  const adjustedDamage = await dealDamage(damage, {
    sourceUnit: attacker,
    targetUnit: defender
  });
  playSound(Sounds.PLAYER_HITS_ENEMY);

  logMessage(
    `${attacker.getName()} hit ${defender.getName()} for ${adjustedDamage} damage!`,
    { state }
  );

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