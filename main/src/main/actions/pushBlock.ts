import { moveUnit } from './moveUnit';
import { moveObject } from './moveObject';
import Unit from '@main/units/Unit';
import Block from '@main/objects/Block';
import { Coordinates } from '@duzh/geometry';
import { isBlocked } from '@main/maps/MapUtils';
import { Direction } from '@duzh/geometry';
import { Game } from '@main/core/Game';

export const pushBlock = async (unit: Unit, block: Block, game: Game) => {
  const coordinates = block.getCoordinates();
  const direction = Direction.between(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plusDirection(coordinates, direction);

  const map = unit.getMap();
  if (map.contains(nextCoordinates) && !isBlocked(nextCoordinates, map)) {
    await moveObject(block, nextCoordinates, map);
    await moveUnit(unit, coordinates, game);
  }
};
