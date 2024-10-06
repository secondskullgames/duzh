import { moveUnit } from './moveUnit';
import { moveObject } from './moveObject';
import Unit from '@main/units/Unit';
import Block from '@main/objects/Block';
import { Coordinates } from '@lib/geometry/Coordinates';
import { isBlocked } from '@main/maps/MapUtils';
import { Direction } from '@lib/geometry/Direction';

export const pushBlock = async (unit: Unit, block: Block) => {
  const coordinates = block.getCoordinates();
  const direction = Direction.between(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plusDirection(coordinates, direction);

  const map = unit.getMap();
  if (map.contains(nextCoordinates) && !isBlocked(nextCoordinates, map)) {
    await moveObject(block, nextCoordinates, map);
    await moveUnit(unit, coordinates);
  }
};
