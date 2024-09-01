import { OrderType, UnitOrder } from '@main/units/orders/UnitOrder';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
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
import { injectable } from 'inversify';

@injectable()
export class OrderExecutor {
  executeOrder = async (
    unit: Unit,
    order: UnitOrder,
    state: GameState,
    session: Session
  ) => {
    switch (order.type) {
      case OrderType.ABILITY: {
        await this._executeAbilityOrder(unit, order, session, state);
        break;
      }
      case OrderType.ATTACK: {
        await this._executeAttackOrder(unit, order, session, state);
        break;
      }
      case OrderType.MOVE: {
        await this._executeMoveOrder(unit, order, session, state);
        break;
      }
      case OrderType.SPELL: {
        await this._executeSpellOrder(unit, order, session, state);
        break;
      }
      case OrderType.STAY:
      // do nothing
    }
  };

  private _executeAbilityOrder = async (
    unit: Unit,
    order: AbilityOrder,
    session: Session,
    state: GameState
  ) => {
    const { ability, direction } = order;
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    await ability.use(unit, coordinates, session, state);
  };

  private _executeAttackOrder = async (
    unit: Unit,
    order: AttackOrder,
    session: Session,
    state: GameState
  ) => {
    const map = unit.getMap();
    const { direction } = order;
    unit.setDirection(direction);
    const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    check(map.contains(coordinates));

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const normalAttack = targetUnit.getAbilityForName(AbilityName.ATTACK);
      await normalAttack.use(unit, coordinates, session, state);
    } else {
      const spawner = getSpawner(map, coordinates);
      if (spawner && spawner.isBlocking()) {
        await attackObject(unit, spawner, state);
      }
    }
  };

  private _executeMoveOrder = async (
    unit: Unit,
    order: MoveOrder,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    const { coordinates } = order;
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    check(map.contains(coordinates));
    if (!isBlocked(coordinates, map)) {
      await walk(unit, direction, session, state);
      return;
    } else {
      const door = getDoor(map, coordinates);
      if (door) {
        await openDoor(unit, door, state);
        return;
      }

      const block = getMovableBlock(map, coordinates);
      if (block) {
        await pushBlock(unit, block, session, state);
        return;
      }
    }
  };

  private _executeSpellOrder = async (
    unit: Unit,
    order: SpellOrder,
    session: Session,
    state: GameState
  ) => {
    const { ability, coordinates } = order;
    await ability.use(unit, coordinates, session, state);
  };
}
