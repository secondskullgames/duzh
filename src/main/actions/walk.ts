import { moveUnit } from './moveUnit';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';

export const walk = async (
  unit: Unit,
  direction: Direction,
  session: Session,
  state: GameState
) => {
  const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);

  const map = unit.getMap();
  if (!map.contains(coordinates) || isBlocked(coordinates, map)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, session, state);
    const playerUnit = session.getPlayerUnit();
    if (unit === playerUnit) {
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};
