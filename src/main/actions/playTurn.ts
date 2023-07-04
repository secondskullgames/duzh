import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import { GlobalContext } from '../core/GlobalContext';

export const playTurn = async (context: GlobalContext) => {

  const map = context.state.getMap();

  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.update(context);
    }
  }

  for (const object of map.getAllObjects()) {
    await object.update(context);
  }

  updateRevealedTiles(context);
  context.state.nextTurn();
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.getFaction() === 'PLAYER') ? 0 : 1
);