import { Direction } from '@lib/geometry/Direction';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { StayOrder } from '@main/units/orders/StayOrder';
import { getDoor, isBlocked } from '@main/maps/MapUtils';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { AttackOrder } from '@main/units/orders/AttackOrder';
import { UnitOrder } from '@main/units/orders/UnitOrder';

export const getMoveOrAttackOrder = (unit: Unit, direction: Direction): UnitOrder => {
  const map = unit.getMap();
  unit.setDirection(direction);
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
      } else {
        return AttackOrder.create({ direction });
      }
    }
  }
};
