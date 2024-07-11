import { StayOrder } from '@main/units/orders/StayOrder';
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import Unit from '@main/units/Unit';
import { UnitController } from '@main/units/controllers/UnitController';
import { Coordinates } from '@lib/geometry/Coordinates';
import { isBlocked } from '@main/maps/MapUtils';
import { Direction } from '@lib/geometry/Direction';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { isHostile } from '@main/units/UnitUtils';
import { AttackOrder } from '@main/units/orders/AttackOrder';
import { canMove } from '@main/units/controllers/ControllerUtils';

export class RoboTurtleController implements UnitController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueOrder = (unit: Unit, _state: GameState, _session: Session): UnitOrder => {
    if (!canMove(unit)) {
      return StayOrder.create();
    }

    const initialDirection = unit.getDirection();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextCoordinates = Coordinates.plusDirection(
        unit.getCoordinates(),
        unit.getDirection()
      );
      if (!isBlocked(unit.getMap(), nextCoordinates)) {
        return MoveOrder.create({ coordinates: nextCoordinates });
      }
      const targetUnit = unit.getMap().getUnit(nextCoordinates);
      if (targetUnit && isHostile(unit, targetUnit)) {
        return AttackOrder.create({ direction: unit.getDirection() });
      }

      unit.setDirection(Direction.rotateClockwise(unit.getDirection()));
      if (unit.getDirection() === initialDirection) {
        return StayOrder.create();
      }
    }
  };
}
