import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import MapInstance from '../maps/MapInstance';
import { moveUnit } from './moveUnit';
import { sleep } from '../utils/promises';
import { updateRevealedTiles } from './updateRevealedTiles';
import { playTurn } from './playTurn';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const fastMove = async (
  unit: Unit,
  direction: Direction,
  { state, map, imageFactory, ticker }: Context
) => {
  let coordinates: Coordinates;
  while (true) {
    coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { state, map, imageFactory, ticker });
      await playTurn({ state, map, imageFactory, ticker });
      await sleep(100);
    } else {
      break;
    }
  }
};