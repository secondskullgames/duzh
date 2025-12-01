import { Coordinates, Direction } from '@duzh/geometry';
import { getDoor, getEnemyUnit, isBlocked } from '@main/maps/MapUtils';
import Unit from '@main/units/Unit';
import { AttackOrder } from '@main/units/orders/AttackOrder';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { StayOrder } from '@main/units/orders/StayOrder';
import { UnitOrder } from '@main/units/orders/UnitOrder';

/** @return null if blocked */
export const getMoveOrAttackOrder = (
  unit: Unit,
  direction: Direction
): UnitOrder | null => {
  const map = unit.getMap();
  const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);

  if (!map.contains(coordinates)) {
    return StayOrder.create();
  } else {
    if (!isBlocked(coordinates, map)) {
      return MoveOrder.create({ coordinates });
    } else {
      const door = getDoor(map, coordinates);
      if (door?.isClosed()) {
        return MoveOrder.create({ coordinates });
      } else if (getEnemyUnit(unit, coordinates, map)) {
        return AttackOrder.create({ direction });
      } else {
        return null;
      }
    }
  }
};
