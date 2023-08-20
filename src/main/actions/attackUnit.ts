import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import { die } from './die';
import { recordKill } from './recordKill';
import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
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
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const attackUnit = async (
  { attacker, defender, getDamage, getDamageLogMessage, sound }: Props,
  { game, map, imageFactory, ticker }: Context
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).onAttack?.(
        equipment,
        defender.getCoordinates(),
        { game, map, imageFactory, ticker }
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
  ticker.log(message, { turn: game.getTurn() });

  attacker.refreshCombat();
  defender.refreshCombat();

  if (defender.getLife() <= 0) {
    await die(defender, { game: game, map, imageFactory, ticker });
    recordKill(attacker, { game: game, ticker });
  }

  await sleep(150);

  attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
  defender.setActivity(Activity.STANDING, 1, defender.getDirection());

  await sleep(50);
};