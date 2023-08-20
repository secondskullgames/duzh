import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import MapInstance from '../maps/MapInstance';
import { moveUnit } from './moveUnit';
import { sleep } from '../utils/promises';
import { playTurn } from './playTurn';

type Context = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const fastMove = async (
  unit: Unit,
  direction: Direction,
  { game, map, imageFactory, ticker }: Context
) => {
  let coordinates: Coordinates;
  while (true) {
    coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { game, map, imageFactory, ticker });
      await playTurn({ game, map, imageFactory, ticker });
      await sleep(100);
    } else {
      break;
    }
  }
};