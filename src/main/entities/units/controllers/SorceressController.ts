import { UnitController } from './UnitController';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { hypotenuse, isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@lib/utils/random';
import KnightMoveBehavior from '@main/entities/units/behaviors/KnightMoveBehavior';
import AvoidUnitBehavior from '@main/entities/units/behaviors/AvoidUnitBehavior';
import WanderBehavior from '@main/entities/units/behaviors/WanderBehavior';
import { FastTeleport } from '@main/entities/units/abilities/FastTeleport';

const teleportChance = 0.2;
const shootChance = 0.5;

export default class SorceressController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit, session);
    return behavior.issueOrder(unit, state, session);
  };

  private _getBehavior = (unit: Unit, session: Session): UnitBehavior => {
    const aiParameters = checkNotNull(unit.getAiParameters());
    const nearestEnemyUnit = session.getPlayerUnit();
    const distanceToNearestEnemy = hypotenuse(
      unit.getCoordinates(),
      nearestEnemyUnit.getCoordinates()
    );
    const canTeleport = unit.getMana() >= FastTeleport.manaCost;
    const wantsToTeleport =
      distanceToNearestEnemy <= aiParameters.visionRange && randChance(teleportChance);
    const canShoot = this._canShoot(unit, nearestEnemyUnit);
    const wantsToShoot = randChance(shootChance);

    console.log(`${unit.getMana()} ${canShoot}`);
    if (canShoot && wantsToShoot) {
      console.log('shoot');
      return new ShootUnitStationaryBehavior({ targetUnit: nearestEnemyUnit });
    } else if (canTeleport && wantsToTeleport) {
      console.log('tp');
      return new KnightMoveBehavior();
    } else if (distanceToNearestEnemy <= aiParameters.visionRange) {
      console.log('avoid');
      return new AvoidUnitBehavior({ targetUnit: nearestEnemyUnit });
    } else {
      console.log('wander');
      return new WanderBehavior();
    }
  };

  private _canShoot = (unit: Unit, targetUnit: Unit): boolean => {
    const aiParameters = checkNotNull(unit.getAiParameters());

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
