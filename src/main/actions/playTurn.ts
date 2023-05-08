import { updateRevealedTiles } from './updateRevealedTiles';
import GameRenderer from '../graphics/renderers/GameRenderer';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export const playTurn = async ({ state, renderer }: Props) => {
  const map = state.getMap();

  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    await unit.update();
  }

  for (const object of map.getAllObjects()) {
    await object.update();
  }

  updateRevealedTiles({ state });
  await renderer.render();
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