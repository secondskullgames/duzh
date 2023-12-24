import { moveUnit } from './moveUnit';
import { moveObject } from './moveObject';
import Unit from '../entities/units/Unit';
import Block from '../entities/objects/Block';
import Coordinates from '../geometry/Coordinates';
import GameState from '../core/GameState';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  session: Session;
}>;

export const pushBlock = async (
  unit: Unit,
  block: Block,
  { state, map, session }: Context
) => {
  const coordinates = block.getCoordinates();
  const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });

  if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
    await moveObject(block, nextCoordinates, { map });
    await moveUnit(unit, coordinates, { state, map, session });
  }
};
