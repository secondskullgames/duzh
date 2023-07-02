import { updateRevealedTiles } from './updateRevealedTiles';
import GameRenderer from '../graphics/renderers/GameRenderer';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export const playTurn = async ({ state, imageFactory }: Context) => {
  const map = state.getMap();

  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.update({ state, imageFactory });
    }
  }

  for (const object of map.getAllObjects()) {
    await object.update({ state, imageFactory });
  }

  updateRevealedTiles({ state });
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