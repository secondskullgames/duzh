import { recordKill } from './recordKill';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import Activity from '../units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { sleep } from '@lib/utils/promises';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { UnitApi } from '@main/units/UnitApi';

export const floorFire = async (
  unit: Unit,
  damage: number,
  state: GameState,
  session: Session
) => {
  const map = unit.getMap();
  // TODO - optimization opportunity
  const adjacentUnits: Unit[] = map.getAllUnits().filter(u => {
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
    return [-1, 0, 1].includes(dx) && [-1, 0, 1].includes(dy) && !(dx === 0 && dy === 0);
  });

  state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);

  for (let i = 0; i < adjacentUnits.length; i++) {
    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    for (let j = 0; j < adjacentUnits.length; j++) {
      adjacentUnits[j].setActivity(Activity.STANDING, 1, unit.getDirection());
      if (j === i) {
        const targetUnit = adjacentUnits[j];
        targetUnit.getEffects().addEffect(StatusEffect.DAMAGED, 1);
        targetUnit.getEffects().addEffect(StatusEffect.BURNING, 1);
        const damageTaken = await UnitApi.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit: targetUnit
        });

        const message = getDamageLogMessage(unit, targetUnit, damageTaken);
        session.getTicker().log(message, { turn: session.getTurn() });
        if (targetUnit.getLife() <= 0) {
          await UnitApi.die(targetUnit, state, session);
          await recordKill(unit, targetUnit, session, state);
        }
      } else {
        adjacentUnits[j].getEffects().removeEffect(StatusEffect.DAMAGED);
        adjacentUnits[j].getEffects().removeEffect(StatusEffect.BURNING);
      }
    }
    await sleep(150);
  }

  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  for (let i = 0; i < adjacentUnits.length; i++) {
    adjacentUnits[i].setActivity(Activity.STANDING, 1, unit.getDirection());
    adjacentUnits[i].getEffects().removeEffect(StatusEffect.DAMAGED);
    adjacentUnits[i].getEffects().removeEffect(StatusEffect.BURNING);
  }
};

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s floor fire hit ${target.getName()} for ${damageTaken} damage!`;
};
