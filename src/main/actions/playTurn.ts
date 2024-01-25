import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from '../core/GameState';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  session: Session;
}>;

/**
 * TODO ugly inverted boolean
 * TODO this method does not make sense
 */
export const playTurn = async (notPlayerOnly: boolean, context: Context) => {
  const { state, map, session } = context;
  session.setTurnInProgress(true);
  if (!notPlayerOnly) {
    const playerUnit = session.getPlayerUnit();
    if (playerUnit.getLife() > 0) {
      await playerUnit.update({ state, map, session });
    }
  } else {
    const sortedUnits = _sortUnits(map.getAllUnits());
    for (const unit of sortedUnits) {
      if (unit.getLife() > 0) {
        await unit.update({ state, map, session });
      }
    }

    for (const object of map.getAllObjects()) {
      await object.update({ state, map, session });
    }
  }

  updateRevealedTiles({ session, map });
  state.nextTurn();
  session.setTurnInProgress(false);
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] =>
  sortBy(units, unit => (unit.getFaction() === 'PLAYER' ? 0 : 1));
