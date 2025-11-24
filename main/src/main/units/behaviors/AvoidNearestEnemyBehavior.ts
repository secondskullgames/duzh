import { UnitBehavior } from './UnitBehavior';
import { UnitOrder } from '../orders/UnitOrder';
import { StayOrder } from '../orders/StayOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import { Teleport } from '@main/abilities/Teleport';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { maxBy } from '@duzh/utils/arrays';
import { manhattanDistance, pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';
import { getMoveOrAttackOrder } from '@main/actions/getMoveOrAttackOrder';
import {
  getNearestEnemyUnit,
  isInVisionRange
} from '@main/units/controllers/ControllerUtils';

export class AvoidNearestEnemyBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit): UnitOrder => {
    const targetUnit = getNearestEnemyUnit(unit);
    if (!targetUnit) {
      return StayOrder.create();
    }

    if (!isInVisionRange(unit, targetUnit)) {
      return StayOrder.create();
    }

    if (this._canTeleport(unit)) {
      const ability = unit.getAbilityForName(AbilityName.TELEPORT);
      const targetCoordinates = this._getTargetTeleportCoordinates(unit, targetUnit);
      if (targetCoordinates) {
        const direction = pointAt(unit.getCoordinates(), targetCoordinates);
        return AbilityOrder.create({ direction, ability });
      }
    }

    const targetCoordinates = this._getTargetWalkCoordinates(unit, targetUnit);
    if (targetCoordinates) {
      const direction = pointAt(unit.getCoordinates(), targetCoordinates);
      // TODO
      return getMoveOrAttackOrder(unit, direction) ?? StayOrder.create();
    }
    return StayOrder.create();
  };

  private _getTargetTeleportCoordinates = (unit: Unit, closestEnemyUnit: Unit) => {
    const map = unit.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
      if (map.contains(coordinates)) {
        if (!isBlocked(coordinates, map)) {
          tiles.push(coordinates);
        }
      }
    }
    const possibleCoordinates = tiles
      .filter(coordinates => manhattanDistance(unit.getCoordinates(), coordinates) >= 3)
      .filter(
        coordinates =>
          manhattanDistance(unit.getCoordinates(), coordinates) <= Teleport.RANGE
      );
    if (possibleCoordinates.length > 0) {
      return maxBy(possibleCoordinates, coordinates =>
        manhattanDistance(coordinates, closestEnemyUnit.getCoordinates())
      );
    }
    return null;
  };

  private _getTargetWalkCoordinates = (
    unit: Unit,
    targetUnit: Unit
  ): Coordinates | null => {
    const map = unit.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
      if (map.contains(coordinates)) {
        if (!isBlocked(coordinates, map)) {
          tiles.push(coordinates);
        }
      }
    }

    if (tiles.length === 0) {
      return null;
    }
    return maxBy(tiles, coordinates =>
      manhattanDistance(coordinates, targetUnit.getCoordinates())
    );
  };

  private _canTeleport = (unit: Unit): boolean => {
    if (unit.hasAbility(AbilityName.TELEPORT)) {
      const ability = unit.getAbilityForName(AbilityName.TELEPORT);
      return unit.getMana() >= ability.manaCost;
    }
    return false;
  };
}
