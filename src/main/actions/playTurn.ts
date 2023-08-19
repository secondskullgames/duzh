import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  ticker: Ticker
}>;

export const playTurn = async ({ state, map, ticker }: Context) => {
  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.update({ state, map, ticker });
    }
  }

  for (const object of map.getAllObjects()) {
    await object.update({ state, map, ticker });
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