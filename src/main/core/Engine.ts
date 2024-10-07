import { doMapEvents } from '@main/actions/doMapEvents';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import Unit from '@main/units/Unit';
import { sortBy } from '@lib/utils/arrays';
import { Faction } from '@main/units/Faction';
import { OrderExecutor } from '@main/units/orders/OrderExecutor';
import GameObject, { ObjectType } from '@main/objects/GameObject';
import Spawner from '@main/objects/Spawner';
import { Game } from '@main/core/Game';

export interface Engine {
  playTurn: (game: Game) => Promise<void>;
}

export class EngineImpl implements Engine {
  private readonly orderExecutor = new OrderExecutor();

  playTurn = async (game: Game) => {
    const { session } = game;
    session.setTurnInProgress(true);
    // TODO consider iterating over every map
    const map = session.getPlayerUnit().getMap();
    const sortedUnits = this._sortUnits(map.getAllUnits());
    for (const unit of sortedUnits) {
      if (unit.getLife() > 0) {
        await this._playUnitTurnAction(unit, game);
      }
    }

    for (const object of map.getAllObjects()) {
      await this._playObjectTurnAction(object, game);
    }

    updateRevealedTiles(map, session.getPlayerUnit());
    await doMapEvents(map, game);
    // TODO weird place to jam this logic
    if (!session.getQueuedAbility()?.isEnabled(session.getPlayerUnit())) {
      session.setQueuedAbility(null);
    }

    session.nextTurn();
    session.setTurnInProgress(false);
  };

  private _playUnitTurnAction = async (unit: Unit, game: Game) => {
    await unit.upkeep(game);
    if (unit.getLife() <= 0) {
      return;
    }
    if (unit.canMove()) {
      const order = unit.getController().issueOrder(unit);
      await this.orderExecutor.executeOrder(unit, order, game);
    }
    await unit.endOfTurn(game);
  };

  private _playObjectTurnAction = async (object: GameObject, game: Game) => {
    switch (object.getObjectType()) {
      case ObjectType.SPAWNER:
        // TODO we should refactor
        await (object as Spawner).playTurnAction(game);
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
