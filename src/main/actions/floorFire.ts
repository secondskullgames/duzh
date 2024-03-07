import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Activity from '../entities/units/Activity';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { sleep } from '@main/utils/promises';
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
        adjacentUnits[j].getEffects().addEffect(UnitEffect.DAMAGED, 1);
        adjacentUnits[j].getEffects().addEffect(UnitEffect.BURNING, 1);
      } else {
        adjacentUnits[j].getEffects().removeEffect(UnitEffect.DAMAGED);
        adjacentUnits[j].getEffects().removeEffect(UnitEffect.BURNING);
      }
    }

    if (i < adjacentUnits.length - 1) {
      await sleep(150);
    }
  }

  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  for (let i = 0; i < adjacentUnits.length; i++) {
    adjacentUnits[i].setActivity(Activity.STANDING, 1, unit.getDirection());
    adjacentUnits[i].getEffects().removeEffect(UnitEffect.DAMAGED);
    adjacentUnits[i].getEffects().removeEffect(UnitEffect.BURNING);
  }

  for (const adjacentUnit of adjacentUnits) {
    await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit: adjacentUnit
    });

    if (adjacentUnit.getLife() <= 0) {
      await die(adjacentUnit, state, session);
      recordKill(unit, adjacentUnit, session, state);
    }
  }
};
