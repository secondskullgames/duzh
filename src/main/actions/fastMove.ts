import { moveUnit } from './moveUnit';
import { playTurn } from './playTurn';
import { GameState } from '../core/GameState';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import { sleep } from '../utils/promises';
import { Session } from '../core/Session';
import { isBlocked } from '../maps/MapUtils';

export const fastMove = async (
  unit: Unit,
  direction: Direction,
  state: GameState,
  session: Session
) => {
  const map = unit.getMap();
  let coordinates: Coordinates;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    if (!isBlocked(map, coordinates)) {
      await moveUnit(unit, coordinates, session, state);
      await playTurn(state, session);
      await sleep(100);
    } else {
      break;
    }
  }
};
