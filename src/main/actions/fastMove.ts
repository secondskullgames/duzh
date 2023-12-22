import { moveUnit } from './moveUnit';
import { playTurn } from './playTurn';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import MapInstance from '../maps/MapInstance';
import { sleep } from '../utils/promises';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  session: Session;
}>;

export const fastMove = async (
  unit: Unit,
  direction: Direction,
  { state, map, imageFactory, session }: Context
) => {
  let coordinates: Coordinates;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { state, map, imageFactory, session });
      await playTurn(true, { state, map, imageFactory, session });
      await sleep(100);
    } else {
      break;
    }
  }
};
