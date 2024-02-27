import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import Activity from '../entities/units/Activity';
import { Coordinates } from '@main/geometry';
import { GameState, Session } from '@main/core';
import { sleep } from '@main/utils/promises';

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
      const activity = j === i ? Activity.BURNED : Activity.STANDING;
      adjacentUnits[j].setActivity(activity, 1, unit.getDirection());
    }

    if (i < adjacentUnits.length - 1) {
      await sleep(150);
    }
  }

  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  for (let i = 0; i < adjacentUnits.length; i++) {
    adjacentUnits[i].setActivity(Activity.STANDING, 1, unit.getDirection());
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
