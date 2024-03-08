import { moveUnit } from './moveUnit';
import { moveObject } from './moveObject';
import Unit from '../entities/units/Unit';
import Block from '../entities/objects/Block';
import Coordinates from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';

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
  if (map.contains(nextCoordinates) && !isBlocked(map, nextCoordinates)) {
    await moveObject(block, nextCoordinates, map);
    await moveUnit(unit, coordinates, session, state);
  }
};
