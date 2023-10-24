import Unit from '../entities/units/Unit';
import Direction from '../geometry/Direction';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

type Context = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const walk = async (
  unit: Unit,
  direction: Direction,
  { game, map, imageFactory, ticker }: Context
) => {
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, { game, map, imageFactory, ticker });
    const playerUnit = game.getPlayerUnit();
    if (unit === playerUnit) {
      playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};