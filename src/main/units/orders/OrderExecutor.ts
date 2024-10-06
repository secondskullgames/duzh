import { OrderType, UnitOrder } from '@main/units/orders/UnitOrder';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { check } from '@lib/utils/preconditions';
import { getDoor, getMovableBlock, getSpawner, isBlocked } from '@main/maps/MapUtils';
import { attackObject } from '@main/actions/attackObject';
import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { AttackOrder } from '@main/units/orders/AttackOrder';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { walk } from '@main/actions/walk';
import { openDoor } from '@main/actions/openDoor';
import { pushBlock } from '@main/actions/pushBlock';
import { SpellOrder } from '@main/units/orders/SpellOrder';
import { AbilityName } from '@main/abilities/AbilityName';

export class OrderExecutor {
  executeOrder = async (unit: Unit, order: UnitOrder) => {
    switch (order.type) {
      case OrderType.ABILITY: {
        await this._executeAbilityOrder(unit, order);
        break;
      }
      case OrderType.ATTACK: {
        await this._executeAttackOrder(unit, order);
        break;
      }
      case OrderType.MOVE: {
        await this._executeMoveOrder(unit, order);
        break;
      }
      case OrderType.SPELL: {
        await this._executeSpellOrder(unit, order);
        break;
      }
      case OrderType.STAY:
      // do nothing
    }
  };

  private _executeAbilityOrder = async (unit: Unit, order: AbilityOrder) => {
    const { ability, direction } = order;
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    await ability.use(unit, coordinates);
  };

  private _executeAttackOrder = async (unit: Unit, order: AttackOrder) => {
    const map = unit.getMap();
    const { direction } = order;
    unit.setDirection(direction);
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    check(map.contains(coordinates));

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const normalAttack = targetUnit.getAbilityForName(AbilityName.ATTACK);
      await normalAttack.use(unit, coordinates);
    } else {
      const spawner = getSpawner(map, coordinates);
      if (spawner && spawner.isBlocking()) {
        await attackObject(unit, spawner);
      }
    }
  };

  private _executeMoveOrder = async (unit: Unit, order: MoveOrder) => {
    const map = unit.getMap();
    const { coordinates } = order;
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    check(map.contains(coordinates));
    if (!isBlocked(coordinates, map)) {
      await walk(unit, direction);
      return;
    } else {
      const door = getDoor(map, coordinates);
      if (door) {
        await openDoor(unit, door);
        return;
      }

      const block = getMovableBlock(map, coordinates);
      if (block) {
        await pushBlock(unit, block);
        return;
      }
    }
  };

  private _executeSpellOrder = async (unit: Unit, order: SpellOrder) => {
    const { ability, coordinates } = order;
    await ability.use(unit, coordinates);
  };
}
