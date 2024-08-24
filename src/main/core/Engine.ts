import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { doMapEvents } from '@main/actions/doMapEvents';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import Unit from '@main/units/Unit';
import { sortBy } from '@lib/utils/arrays';
import { Faction } from '@main/units/Faction';
import { OrderExecutor } from '@main/units/orders/OrderExecutor';
import GameObject, { ObjectType } from '@main/objects/GameObject';
import Spawner from '@main/objects/Spawner';
import { Graphics } from '@lib/graphics/Graphics';
import { injectable } from 'inversify';

export interface Engine {
  getState: () => GameState;
  getSession: () => Session;
  playTurn: () => Promise<void>;
  render: (graphics: Graphics) => Promise<void>;
}

export const Engine = Symbol('Engine');

@injectable()
export class EngineImpl implements Engine {
  constructor(
    private readonly session: Session,
    private readonly state: GameState,
    // TODO weird 3rd arg but OK
    private readonly orderExecutor: OrderExecutor
  ) {}

  getState = (): GameState => this.state;
  getSession = (): Session => this.session;

  playTurn = async () => {
    const { state, session } = this;
    const map = session.getMap();
    session.setTurnInProgress(true);
    const sortedUnits = this._sortUnits(map.getAllUnits());
    for (const unit of sortedUnits) {
      if (unit.getLife() > 0) {
        await this._playUnitTurnAction(unit, state, session);
      }
    }

    for (const object of map.getAllObjects()) {
      await this._playObjectTurnAction(object, state, session);
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

  render = async (graphics: Graphics) => {
    const { session } = this;
    const scene = session.getCurrentScene();
    scene?.render(graphics);
  };

  private _playUnitTurnAction = async (
    unit: Unit,
    state: GameState,
    session: Session
  ) => {
    await unit.upkeep(state, session);
    if (unit.getLife() <= 0) {
      return;
    }
    if (unit.canMove()) {
      const order = unit.getController().issueOrder(unit);
      await this.orderExecutor.executeOrder(unit, order, state, session);
    }
    await unit.endOfTurn(state, session);
  };

  private _playObjectTurnAction = async (
    object: GameObject,
    state: GameState,
    session: Session
  ) => {
    switch (object.getObjectType()) {
      case ObjectType.SPAWNER:
        // TODO we should refactor
        await (object as Spawner).playTurnAction(state, session);
        break;
      default:
      // nothing to do!
    }
  };

  /**
   * Sort the list of units such that the player unit is first in the order,
   * and other units appear in unspecified order
   */
  private _sortUnits = (units: Unit[]): Unit[] =>
    sortBy(units, unit => (unit.getFaction() === Faction.PLAYER ? 0 : 1));
}
