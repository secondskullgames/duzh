import { moveUnit } from './moveUnit';
import { moveObject } from './moveObject';
import Unit from '../entities/units/Unit';
import Block from '../entities/objects/Block';
import Coordinates from '../geometry/Coordinates';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

export const pushBlock = async (
  unit: Unit,
  block: Block,
  session: Session,
  state: GameState
) => {
  const coordinates = block.getCoordinates();
  const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });

  const map = session.getMap();
  if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
    await moveObject(block, nextCoordinates, map);
    await moveUnit(unit, coordinates, session, state);
  }
};
