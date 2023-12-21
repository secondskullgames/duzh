import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  session: Session;
}>;

export const playTurn = async ({ state, map, imageFactory, session }: Context) => {
  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.update({ state, map, imageFactory, session });
    }
  }

  for (const object of map.getAllObjects()) {
    await object.update({ state, map, imageFactory, session });
  }

  updateRevealedTiles({ state, map });
  state.nextTurn();
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] =>
  sortBy(units, unit => (unit.getFaction() === 'PLAYER' ? 0 : 1));
