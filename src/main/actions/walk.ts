import { moveUnit } from './moveUnit';
import Unit from '../entities/units/Unit';
import Direction from '../geometry/Direction';
import Coordinates from '../geometry/Coordinates';
import { GameState } from '../core/GameState';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { Session } from '../core/Session';

export const walk = async (
  unit: Unit,
  direction: Direction,
  session: Session,
  state: GameState
) => {
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  const map = session.getMap();
  if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, session, state);
    const playerUnit = session.getPlayerUnit();
    if (unit === playerUnit) {
      playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};
