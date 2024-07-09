import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { doMapEvents } from '@main/actions/doMapEvents';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import Unit from '@main/units/Unit';
import { sortBy } from '@lib/utils/arrays';
import { Faction } from '@main/units/Faction';
import { injectable } from 'inversify';

export interface Engine {
  getState: () => GameState;
  getSession: () => Session;
  playTurn: () => Promise<void>;
}

export const Engine = Symbol('Engine');

@injectable()
export class EngineImpl implements Engine {
  constructor(
    private readonly session: Session,
    private readonly state: GameState
  ) {}

  getState = (): GameState => this.state;
  getSession = (): Session => this.session;

  playTurn = async () => {
    const { state, session } = this;
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
    await doMapEvents(state, session);
    // TODO weird place to jam this logic
    if (!session.getQueuedAbility()?.isEnabled(session.getPlayerUnit())) {
      session.setQueuedAbility(null);
    }

    session.nextTurn();
    session.setTurnInProgress(false);
  };
}

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] =>
  sortBy(units, unit => (unit.getFaction() === Faction.PLAYER ? 0 : 1));
