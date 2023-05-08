import Unit from '../entities/units/Unit';
import Block from '../entities/objects/Block';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import GameState from '../core/GameState';
import { moveObject } from './moveObject';

type Props = Readonly<{
  state: GameState
}>;

export const pushBlock = async (unit: Unit, block: Block, { state }: Props) => {
  const map = state.getMap();
  const coordinates = block.getCoordinates();
  const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });

  if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
    await moveObject(block, nextCoordinates, { state });
    await moveUnit(unit, coordinates, { state });
  }
};