import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export const playTurn = async ({ state, map, spriteFactory, ticker }: Context) => {
  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.update({ state, map, spriteFactory, ticker });
    }
  }

  for (const object of map.getAllObjects()) {
    await object.update({ state, map, spriteFactory, ticker });
  }

  updateRevealedTiles({ state, map });
  state.nextTurn();
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.getFaction() === 'PLAYER') ? 0 : 1
);