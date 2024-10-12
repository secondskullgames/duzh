import Unit from '@main/units/Unit';
import { sortBy } from '@lib/utils/arrays';
import { Faction } from '@main/units/Faction';
import GameObject, { ObjectType } from '@main/objects/GameObject';
import Spawner from '@main/objects/Spawner';
import { Game } from '@main/core/Game';
import PlayerUnitController from '@main/units/controllers/PlayerUnitController';

export interface Engine {
  playTurn: (game: Game) => Promise<void>;
}

export class EngineImpl implements Engine {
  playTurn = async (game: Game) => {
    const { state } = game;
    state.setTurnInProgress(true);
    // TODO consider iterating over every map
    const map = state.getPlayerUnit().getMap();
    const sortedUnits = this._sortUnits(map.getAllUnits());
    for (const unit of sortedUnits) {
      if (unit.getLife() > 0) {
        await game.unitService.playUnitTurnAction(unit, game);
      }
    }

    for (const object of map.getAllObjects()) {
      await this._playObjectTurnAction(object, game);
    }

    game.mapController.updateRevealedTiles(map, game);
    await game.mapController.doMapEvents(map, game);

    // TODO weird place to jam this logic
    const playerUnit = state.getPlayerUnit();
    const playerController = playerUnit.getController() as PlayerUnitController;
    if (!playerController.getQueuedAbility()?.isEnabled(state.getPlayerUnit())) {
      playerController.setQueuedAbility(null);
    }

    state.nextTurn();
    state.setTurnInProgress(false);
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
