import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import { die } from './die';
import { recordKill } from './recordKill';
import GameState from '../core/GameState';
import Activity from '../entities/units/Activity';
import { sleep } from '../utils/promises';
import { EquipmentScript } from '../equipment/EquipmentScript';
import { SoundEffect } from '../sounds/types';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

type Props = Readonly<{
  attacker: Unit,
  defender: Unit,
  getDamage: (unit: Unit) => number,
  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number) => string,
  sound: SoundEffect
}>;

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  ticker: Ticker
}>;

export const attackUnit = async (
  { attacker, defender, getDamage, getDamageLogMessage, sound }: Props,
  { state, map, ticker }: Context
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).onAttack?.(
        equipment,
        defender.getCoordinates(),
        { state, map, ticker }
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
  ticker.log(message, { turn: state.getTurn() });

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, { state, map, ticker });
    recordKill(attacker, { state, ticker });
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());

  await sleep(50);
};