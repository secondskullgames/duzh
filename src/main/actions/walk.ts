import { moveUnit } from './moveUnit';
import Unit from '../entities/units/Unit';
import Direction from '../geometry/Direction';
import Coordinates from '../geometry/Coordinates';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  session: Session;
}>;

export const walk = async (
  unit: Unit,
  direction: Direction,
  { state, map, imageFactory, session }: Context
) => {
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, { state, map, imageFactory, session });
    const playerUnit = state.getPlayerUnit();
    if (unit === playerUnit) {
      playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};
