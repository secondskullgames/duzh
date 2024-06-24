import { moveObject } from './moveObject';
import Unit from '@main/units/Unit';
import Block from '@main/objects/Block';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';
import { UnitApi } from '@main/units/UnitApi';

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
    await UnitApi.moveUnit(unit, coordinates, session, state);
  }
};
