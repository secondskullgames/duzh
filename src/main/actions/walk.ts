import { moveUnit } from './moveUnit';
import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates, Direction } from '@main/geometry';

export const walk = async (
  unit: Unit,
  direction: Direction,
  session: Session,
  state: GameState
) => {
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  const map = unit.getMap();
  if (!map.contains(coordinates) || isBlocked(map, coordinates)) {
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
