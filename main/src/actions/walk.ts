import { moveUnit } from './moveUnit';
import Unit from '../units/Unit';
import { Coordinates, Direction } from '@duzh/geometry';
import { isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

export const walk = async (unit: Unit, direction: Direction, game: Game) => {
  const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);

  const { soundController, state } = game;
  const map = unit.getMap();
  if (!map.contains(coordinates) || isBlocked(coordinates, map)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, game);
    const playerUnit = state.getPlayerUnit();
    if (unit === playerUnit) {
      soundController.playSound('footstep');
    }
    unit.recordStepTaken();
  }
};
