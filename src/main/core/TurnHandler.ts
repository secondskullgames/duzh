import Unit from '../units/Unit';
import { sortBy } from '../utils/arrays';
import { render } from './actions';
import GameState from './GameState';

const playTurn = async () => {
  const state = GameState.getInstance();
  const map = state.getMap();

  const sortedUnits = _sortUnits(map.units);
  for (const unit of sortedUnits) {
    await unit.update();
  }

  // TODO: update other things
  for (const spawner of map.spawners) {
    await spawner.update();
  }

  await render();
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

export default {
  playTurn
};
