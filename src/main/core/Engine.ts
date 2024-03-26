import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { doMapEvents } from '@main/actions/doMapEvents';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import Unit from '@main/units/Unit';
import { sortBy } from '@lib/utils/arrays';
import { Faction } from '@main/units/Faction';
import { inject, injectable } from 'inversify';

export interface Engine {
  playTurn: () => Promise<void>;
}

export const Engine = Symbol('Engine');

@injectable()
export class EngineImpl implements Engine {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState
  ) {}

  playTurn = async () => {
    const { state, session } = this;
    const playerUnit = session.getPlayerUnit();
    const map = playerUnit.getMap();
    state.setTurnInProgress(true);
    const sortedUnits = _sortUnits(map.getAllUnits());
    for (const unit of sortedUnits) {
      if (unit.getLife() > 0) {
        await unit.playTurnAction(state, session);
      }
    }

    for (const object of map.getAllObjects()) {
      await object.playTurnAction(state, session);
    }

    updateRevealedTiles(map, playerUnit);
    await doMapEvents(map, state, session);
    // TODO weird place to jam this logic
    if (!session.getQueuedAbility()?.isEnabled(playerUnit)) {
      session.setQueuedAbility(null);
    }

    state.nextTurn();
    state.setTurnInProgress(false);
  };
}

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] =>
  sortBy(units, unit => (unit.getFaction() === Faction.PLAYER ? 0 : 1));
