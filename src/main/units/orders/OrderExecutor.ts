import { OrderType, UnitOrder } from '@main/units/orders/UnitOrder';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { check } from '@lib/utils/preconditions';
import { getDoor, getMovableBlock, getSpawner, isBlocked } from '@main/maps/MapUtils';
import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { AttackOrder } from '@main/units/orders/AttackOrder';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { openDoor } from '@main/actions/openDoor';
import { pushBlock } from '@main/actions/pushBlock';
import { SpellOrder } from '@main/units/orders/SpellOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import { Game } from '@main/core/Game';
import { Direction } from '@lib/geometry/Direction';
import Sounds from '@main/sounds/Sounds';
import { injectable } from 'inversify';

@injectable()
export class OrderExecutor {
  executeOrder = async (unit: Unit, order: UnitOrder, game: Game) => {
    switch (order.type) {
      case OrderType.ABILITY: {
        await this._executeAbilityOrder(unit, order, game);
        break;
      }
      case OrderType.ATTACK: {
        await this._executeAttackOrder(unit, order, game);
        break;
      }
      case OrderType.MOVE: {
        await this._executeMoveOrder(unit, order, game);
        break;
      }
      case OrderType.SPELL: {
        await this._executeSpellOrder(unit, order, game);
        break;
      }
      case OrderType.STAY:
      // do nothing
    }
  };

  private _executeAbilityOrder = async (unit: Unit, order: AbilityOrder, game: Game) => {
    const { ability, direction } = order;
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    await ability.use(unit, coordinates, game);
  };

  private _executeAttackOrder = async (unit: Unit, order: AttackOrder, game: Game) => {
    const map = unit.getMap();
    const { direction } = order;
    unit.setDirection(direction);
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    check(map.contains(coordinates));

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const normalAttack = targetUnit.getAbilityForName(AbilityName.ATTACK);
      await normalAttack.use(unit, coordinates, game);
    } else {
      const spawner = getSpawner(map, coordinates);
      if (spawner && spawner.isBlocking()) {
        await game.unitService.attackObject(unit, spawner, game);
      }
    }
  };

  private _executeMoveOrder = async (unit: Unit, order: MoveOrder, game: Game) => {
    const map = unit.getMap();
    const { coordinates } = order;
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    check(map.contains(coordinates));
    if (!isBlocked(coordinates, map)) {
      await this._walk(unit, direction, game);
      return;
    } else {
      const door = getDoor(map, coordinates);
      if (door) {
        await openDoor(unit, door, game);
        return;
      }

      const block = getMovableBlock(map, coordinates);
      if (block) {
        await pushBlock(unit, block, game);
        return;
      }
    }
  };

  private _executeSpellOrder = async (unit: Unit, order: SpellOrder, game: Game) => {
    const { ability, coordinates } = order;
    await ability.use(unit, coordinates, game);
  };

  private _walk = async (unit: Unit, direction: Direction, game: Game) => {
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);

    const { soundPlayer, state } = game;
    const map = unit.getMap();
    if (!map.contains(coordinates) || isBlocked(coordinates, map)) {
      // do nothing
    } else {
      await game.unitService.moveUnit(unit, coordinates, game);
      const playerUnit = state.getPlayerUnit();
      if (unit === playerUnit) {
        soundPlayer.playSound(Sounds.FOOTSTEP);
      }
      unit.recordStepTaken();
    }
  };
}
