import { UnitController } from './UnitController';
import { UnitOrder } from '../orders/UnitOrder';
import StayBehavior from '../behaviors/StayBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '@main/abilities/ShootTurretArrow';
import Unit from '@main/units/Unit';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { hypotenuse, isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@lib/utils/random';
import KnightMoveBehavior from '@main/units/behaviors/KnightMoveBehavior';

const teleportChance = 0.25;
const shootChance = 0.9;

export default class DragonShooterController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit, session);
    return behavior.issueOrder(unit, state, session);
  };

  private _getBehavior = (unit: Unit, session: Session): UnitBehavior => {
    const nearestEnemyUnit = session.getPlayerUnit();
    const distanceToNearestEnemy = hypotenuse(
      unit.getCoordinates(),
      nearestEnemyUnit.getCoordinates()
    );
    const wantsToTeleport = distanceToNearestEnemy <= 2 || randChance(teleportChance);
    const canShoot = this._canShoot(unit, nearestEnemyUnit);
    const wantsToShoot = randChance(shootChance);

    if (wantsToTeleport) {
      return new KnightMoveBehavior();
    } else if (canShoot && wantsToShoot) {
      return new ShootUnitStationaryBehavior({ targetUnit: nearestEnemyUnit });
    } else {
      return new StayBehavior();
    }
  };

  private _canShoot = (unit: Unit, targetUnit: Unit): boolean => {
    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'DragonShooterController requires aiParams!'
    );

    const { visionRange } = aiParameters;

    const distanceToTarget = hypotenuse(
      unit.getCoordinates(),
      targetUnit.getCoordinates()
    );

    return (
      unit.getMana() >= ShootTurretArrow.manaCost &&
      distanceToTarget <= visionRange &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        unit.getMap(),
        unit.getCoordinates(),
        targetUnit.getCoordinates()
      )
    );
  };
}
