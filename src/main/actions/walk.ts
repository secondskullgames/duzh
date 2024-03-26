import { moveUnit } from './moveUnit';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';
import { isPlayerUnit } from '@main/units/UnitUtils';

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
    if (isPlayerUnit(unit)) {
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};
