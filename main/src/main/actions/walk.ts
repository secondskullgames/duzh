import { moveUnit } from './moveUnit';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Direction } from '@duzh/geometry';
import { Coordinates } from '@duzh/geometry';
import { isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

export const walk = async (unit: Unit, direction: Direction, game: Game) => {
  const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);

  const { soundPlayer, state } = game;
  const map = unit.getMap();
  if (!map.contains(coordinates) || isBlocked(coordinates, map)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, game);
    const playerUnit = state.getPlayerUnit();
    if (unit === playerUnit) {
      soundPlayer.playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};
