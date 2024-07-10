import { UnitController } from './UnitController';
import UnitOrder from '../orders/UnitOrder';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import Unit from '@main/units/Unit';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { hypotenuse, isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@lib/utils/random';
import KnightMoveBehavior from '@main/units/behaviors/KnightMoveBehavior';
import AvoidUnitBehavior from '@main/units/behaviors/AvoidUnitBehavior';
import WanderBehavior from '@main/units/behaviors/WanderBehavior';
import { AbilityName } from '@main/abilities/AbilityName';
import { UnitAbility } from '@main/abilities/UnitAbility';

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
    const fastTeleportAbility = UnitAbility.abilityForName(AbilityName.FAST_TELEPORT);
    const canTeleport =
      unit.hasAbility(AbilityName.FAST_TELEPORT) &&
      unit.getMana() >= fastTeleportAbility.manaCost;
    const wantsToTeleport =
      distanceToNearestEnemy <= aiParameters.visionRange && randChance(teleportChance);
    const canShoot = this._canShoot(unit, nearestEnemyUnit);
    const wantsToShoot = randChance(shootChance);

    if (canShoot && wantsToShoot) {
      return new ShootUnitStationaryBehavior({ targetUnit: nearestEnemyUnit });
    } else if (canTeleport && wantsToTeleport) {
      return new KnightMoveBehavior();
    } else if (distanceToNearestEnemy <= aiParameters.visionRange) {
      return new AvoidUnitBehavior({ targetUnit: nearestEnemyUnit });
    } else {
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

    const shootTurretArrowAbility = UnitAbility.abilityForName(
      AbilityName.SHOOT_TURRET_ARROW
    );

    return (
      unit.getMana() >= shootTurretArrowAbility.manaCost &&
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
