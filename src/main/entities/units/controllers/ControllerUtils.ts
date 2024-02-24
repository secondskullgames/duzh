import ArcherController from './ArcherController';
import BasicEnemyController from './BasicEnemyController';
import WizardController from './WizardController';
import DragonShooterController from './DragonShooterController';
import { UnitController } from './UnitController';
import { Session } from '../../../core/Session';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { Feature } from '../../../utils/features';
import { hypotenuse, isInStraightLine } from '../../../geometry/CoordinatesUtils';
import MapInstance from '../../../maps/MapInstance';
import { hasUnblockedStraightLineBetween } from '../../../utils/geometry';
import { AbilityName } from '../abilities/AbilityName';
import { UnitAbility } from '../abilities/UnitAbility';
import Coordinates from '../../../geometry/Coordinates';
import { Dash } from '../abilities/Dash';

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

export const chooseUnitController = (unitClass: string): UnitController => {
  switch (unitClass) {
    case 'archer':
      return new ArcherController();
    case 'robed_wizard':
      return new WizardController();
    case 'dragon_shooter':
      return new DragonShooterController();
    default:
      return new BasicEnemyController();
  }
};

export const canShoot = (
  unit: Unit,
  targetUnit: Unit,
  abilityName: AbilityName
): boolean => {
  const ability = UnitAbility.abilityForName(abilityName);
  return (
    unit.getEquipment().getBySlot('RANGED_WEAPON') !== null &&
    unit.getMana() >= ability.manaCost &&
    isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
    hasUnblockedStraightLineBetween(
      unit.getCoordinates(),
      targetUnit.getCoordinates(),
      unit.getMap()
    )
  );
};

export const canDash = (
  unit: Unit,
  coordinates: Coordinates | undefined,
  map: MapInstance
) => {
  if (!unit.hasAbility(AbilityName.DASH) || unit.getMana() < Dash.manaCost) {
    return false;
  }

  if (coordinates) {
    const plusOne = Coordinates.plus(unit.getCoordinates(), unit.getDirection());
    const plusTwo = Coordinates.plus(plusOne, unit.getDirection());
    return (
      map.contains(plusOne) &&
      map.contains(plusTwo) &&
      !map.isBlocked(plusOne) &&
      !map.isBlocked(plusTwo) &&
      Coordinates.equals(coordinates, plusTwo)
    );
  }
  return false;
};
