import Unit from '../entities/units/Unit';
import Block from '../entities/objects/Block';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import GameState from '../core/GameState';
import { moveObject } from './moveObject';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export const pushBlock = async (
  unit: Unit,
  block: Block,
  { state, map, spriteFactory, ticker }: Context
) => {
  const coordinates = block.getCoordinates();
  const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
  const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });

  if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
    await moveObject(block, nextCoordinates, { map });
    await moveUnit(unit, coordinates, { state, map, spriteFactory, ticker });
  }
};