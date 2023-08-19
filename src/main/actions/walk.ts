import Unit from '../entities/units/Unit';
import Direction from '../geometry/Direction';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import GameState from '../core/GameState';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export const walk = async (
  unit: Unit,
  direction: Direction,
  { state, map, spriteFactory, ticker }: Context
) => {
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, { state, map, spriteFactory, ticker });
    const playerUnit = state.getPlayerUnit();
    if (unit === playerUnit) {
      playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};