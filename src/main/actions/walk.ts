import Unit from '../entities/units/Unit';
import Direction from '../geometry/Direction';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GlobalContext } from '../core/GlobalContext';


export const walk = async (
  unit: Unit,
  direction: Direction,
  context: GlobalContext
) => {
  const { state } = context;
  const map = state.getMap();

  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, context);
    const playerUnit = state.getPlayerUnit();
    if (unit === playerUnit) {
      playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};