import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import MapInstance from '../maps/MapInstance';
import { moveUnit } from './moveUnit';
import { sleep } from '../utils/promises';
import { playTurn } from './playTurn';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export const fastMove = async (
  unit: Unit,
  direction: Direction,
  { state, map, spriteFactory, ticker }: Context
) => {
  let coordinates: Coordinates;
  while (true) {
    coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { state, map, spriteFactory, ticker });
      await playTurn({ state, map, spriteFactory, ticker });
      await sleep(100);
    } else {
      break;
    }
  }
};