import PlayerUnitController from '../units/controllers/PlayerUnitController';
import Unit from '../units/Unit';
import { clear, sortBy } from '../utils/arrays';
import { render } from './actions';
import GameState from './GameState';

const playTurn = async (playerUnitOrder: (() => Promise<void>) | null) => {
  const playerUnit = GameState.getInstance().playerUnit;
  const playerController = playerUnit.controller as PlayerUnitController;
  playerController.queuedOrder = playerUnitOrder;
  return _update();
};

const _update = async () => {
  const state = GameState.getInstance();
  const map = state.getMap();

  const sortedUnits = _sortUnits(map.units);
  for (const unit of sortedUnits) {
    await unit.update();
  }

  await render();
  state.turn++;
  clear(state.messages);
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.faction === 'PLAYER') ? 0 : 1
);

export default {
  playTurn
};
