import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '@main/actions/moveUnit';
import { sleep } from '@main/utils/promises';
import { Session, GameState } from '@main/core';
import { manhattanDistance, pointAt, Coordinates } from '@main/geometry';
import { isBlocked } from '@main/maps/MapUtils';
import { Activity, Unit } from '@main/entities/units';

export const TELEPORT_RANGE = 3;
const manaCost = 20;

export const Teleport: UnitAbility = {
  name: AbilityName.TELEPORT,
  icon: null,
  manaCost,
  innate: false,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (manhattanDistance(unit.getCoordinates(), coordinates) > TELEPORT_RANGE) {
      throw new Error(`Can't teleport more than ${TELEPORT_RANGE} units`);
    }

    const map = session.getMap();

    const maybeSleep = async () => {
      if (map.isTileRevealed(coordinates)) {
        await sleep(100);
      }
    };

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      unit.spendMana(manaCost);
      state.getSoundPlayer().playSound(Sounds.WIZARD_VANISH);

      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.VANISHING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      await maybeSleep();

      await moveUnit(unit, coordinates, session, state);
      await maybeSleep();

      for (let i = 1; i <= 4; i++) {
        if (i === 1) {
          state.getSoundPlayer().playSound(Sounds.WIZARD_APPEAR);
        }
        unit.setActivity(Activity.APPEARING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
