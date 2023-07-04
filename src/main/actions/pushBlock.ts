import Unit from '../entities/units/Unit';
import Block from '../entities/objects/Block';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import { moveObject } from './moveObject';
import { GlobalContext } from '../core/GlobalContext';

export const pushBlock = async (
  unit: Unit,
  block: Block,
  context: GlobalContext
) => {
  const { state, imageFactory, ticker } = context;
  const map = state.getMap();
  const coordinates = block.getCoordinates();
  const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });

  if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
    await moveObject(block, nextCoordinates, context);
    await moveUnit(unit, coordinates, { state, imageFactory, ticker });
  }
};