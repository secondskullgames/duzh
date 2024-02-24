import { Session } from '../../../core/Session';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { Feature } from '../../../utils/features';
import { hypotenuse } from '../../../maps/MapUtils';

export const canMove = (unit: Unit, session: Session): boolean => {
  const aiParameters = checkNotNull(
    unit.getAiParameters(),
    'BasicEnemyController requires aiParams!'
  );
  const { speed } = aiParameters;

  if (Feature.isEnabled(Feature.DETERMINISTIC_ENEMY_MOVEMENT)) {
    const turn = session.getTurn();
    return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));
  } else {
    return Math.random() < speed;
  }
};

export const canSee = (unit: Unit, targetUnit: Unit) => {
  const aiParameters = checkNotNull(unit.getAiParameters());
  const distanceToPlayer = hypotenuse(unit.getCoordinates(), targetUnit.getCoordinates());
  return distanceToPlayer <= aiParameters.visionRange;
};

/**
 * Assumes player unit exists
 */
export const getClosestEnemy = (unit: Unit): Unit => {
  const enemyUnit = unit
    .getMap()
    .getAllUnits()
    .find(u => u.getFaction() !== unit.getFaction());
  return checkNotNull(enemyUnit);
};
