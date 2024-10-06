import { moveUnit } from './moveUnit';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { isBlocked } from '@main/maps/MapUtils';
import { Globals } from '@main/core/globals';

export const walk = async (unit: Unit, direction: Direction) => {
  const { session, soundPlayer } = Globals;
  const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);

  const map = unit.getMap();
  if (!map.contains(coordinates) || isBlocked(coordinates, map)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates);
    const playerUnit = session.getPlayerUnit();
    if (unit === playerUnit) {
      soundPlayer.playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};
