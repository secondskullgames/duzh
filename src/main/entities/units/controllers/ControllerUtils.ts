import ArcherController from './ArcherController';
import BasicEnemyController from './BasicEnemyController';
import WizardController from './WizardController';
import DragonShooterController from './DragonShooterController';
import { UnitController } from './UnitController';
import Unit from '../Unit';
import MapInstance from '../../../maps/MapInstance';
import { AbilityName } from '../abilities/AbilityName';
import { UnitAbility } from '../abilities/UnitAbility';
import { Dash } from '../abilities/Dash';
import Coordinates from '@lib/geometry/Coordinates';
import { hypotenuse, isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { checkNotNull } from '@lib/utils/preconditions';
import { hasUnblockedStraightLineBetween, isBlocked } from '@main/maps/MapUtils';
import SorceressController from '@main/entities/units/controllers/SorceressController';

export const canMove = (unit: Unit): boolean => {
  const aiParameters = checkNotNull(
    unit.getAiParameters(),
    'BasicEnemyController requires aiParams!'
  );
  const { speed } = aiParameters;
  return Math.random() < speed;
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
    case 'sorceress':
      return new SorceressController();
    default:
      return new BasicEnemyController();
  }
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
      !isBlocked(map, plusOne) &&
      !isBlocked(map, plusTwo) &&
      Coordinates.equals(coordinates, plusTwo)
    );
  }
  return false;
};
