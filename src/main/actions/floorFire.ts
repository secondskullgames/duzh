import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import Activity from '../entities/units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { sleep } from '@lib/utils/promises';
import { UnitEffect } from '@main/entities/units/effects/UnitEffect';

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
        targetUnit.getEffects().addEffect(UnitEffect.DAMAGED, 1);
        targetUnit.getEffects().addEffect(UnitEffect.BURNING, 1);
        await dealDamage(damage, {
          sourceUnit: unit,
          targetUnit: targetUnit
        });

        if (targetUnit.getLife() <= 0) {
          await die(targetUnit, state, session);
          recordKill(unit, targetUnit, session, state);
        }
      } else {
        adjacentUnits[j].getEffects().removeEffect(UnitEffect.DAMAGED);
        adjacentUnits[j].getEffects().removeEffect(UnitEffect.BURNING);
      }
    }
    await sleep(150);
  }

  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  for (let i = 0; i < adjacentUnits.length; i++) {
    adjacentUnits[i].setActivity(Activity.STANDING, 1, unit.getDirection());
    adjacentUnits[i].getEffects().removeEffect(UnitEffect.DAMAGED);
    adjacentUnits[i].getEffects().removeEffect(UnitEffect.BURNING);
  }
};
