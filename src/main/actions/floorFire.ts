import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import Activity from '../units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { sleep } from '@lib/utils/promises';
import { StatusEffect } from '@main/units/effects/StatusEffect';

export const floorFire = async (
  unit: Unit,
  damage: number,
  state: GameState,
  session: Session
) => {
  const map = unit.getMap();
  // TODO - optimization opportunity
  const targets: Unit[] = map.getAllUnits().filter(u => {
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
    return [-1, 0, 1].includes(dx) && [-1, 0, 1].includes(dy) && !(dx === 0 && dy === 0);
  });

  state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);

  for (let i = 0; i < targets.length; i++) {
    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    for (let j = 0; j < targets.length; j++) {
      targets[j].setActivity(Activity.STANDING, 1, unit.getDirection());
      if (j === i) {
        const targetUnit = targets[j];
        targetUnit.getEffects().addEffect(StatusEffect.DAMAGED, 1);
        targetUnit.getEffects().addEffect(StatusEffect.BURNING, 1);
        const damageTaken = await dealDamage(damage, {
          sourceUnit: unit,
          targetUnit: targetUnit
        });

        const message = getDamageLogMessage(unit, targetUnit, damageTaken);
        session.getTicker().log(message, { turn: session.getTurn() });
        if (targetUnit.getLife() <= 0) {
          await die(targetUnit, state, session);
          recordKill(unit, targetUnit, session, state);
        }
      } else {
        targets[j].getEffects().removeEffect(StatusEffect.DAMAGED);
        targets[j].getEffects().removeEffect(StatusEffect.BURNING);
      }
    }
    await sleep(150);
  }

  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  for (const target of targets) {
    target.setActivity(Activity.STANDING, 1, target.getDirection());
    target.getEffects().removeEffect(StatusEffect.DAMAGED);
    target.getEffects().removeEffect(StatusEffect.BURNING);
  }
};

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s floor fire hit ${target.getName()} for ${damageTaken} damage!`;
};
