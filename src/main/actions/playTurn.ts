import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

export const playTurn = async (state: GameState, session: Session) => {
  const map = session.getMap();
  session.setTurnInProgress(true);
  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.playTurnAction(state, session);
    }
  }

  for (const object of map.getAllObjects()) {
    await object.playTurnAction(state, session);
  }

  updateRevealedTiles(map, session.getPlayerUnit());
  session.nextTurn();
  session.setTurnInProgress(false);
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] =>
  sortBy(units, unit => (unit.getFaction() === 'PLAYER' ? 0 : 1));
