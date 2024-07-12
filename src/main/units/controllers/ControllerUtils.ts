import ArcherController from './ArcherController';
import BasicEnemyController from './BasicEnemyController';
import WizardController from './WizardController';
import DragonShooterController from './DragonShooterController';
import { UnitController } from './UnitController';
import MapInstance from '@main/maps/MapInstance';
import { AbilityName } from '@main/abilities/AbilityName';
import { Dash } from '@main/abilities/Dash';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { hypotenuse, manhattanDistance } from '@lib/geometry/CoordinatesUtils';
import { checkNotNull } from '@lib/utils/preconditions';
import { isBlocked } from '@main/maps/MapUtils';
import { SorceressController } from '@main/units/controllers/SorceressController';
import { minBy } from '@lib/utils/arrays';
import { isHostile } from '@main/units/UnitUtils';
import { RoboTurtleController } from '@main/units/controllers/RoboTurtleController';

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

export const getNearestEnemyUnit = (unit: Unit): Unit | null => {
  const enemyUnits = unit
    .getMap()
    .getAllUnits()
    .filter(otherUnit => isHostile(unit, otherUnit));

  if (enemyUnits.length === 0) {
    return null;
  }

  return minBy(enemyUnits, enemyUnit =>
    manhattanDistance(unit.getCoordinates(), enemyUnit.getCoordinates())
  );
};

export const chooseUnitController = (unitClass: string): UnitController => {
  switch (unitClass) {
    case 'goblin_archer':
      return new ArcherController();
    case 'robed_wizard':
      return new WizardController();
    case 'dragon_shooter':
      return new DragonShooterController();
    case 'sorceress':
      return new SorceressController();
    case 'robo_turtle':
      return new RoboTurtleController();
    default:
      return new BasicEnemyController();
  }
};

export const canDash = (
  unit: Unit,
  coordinates: Coordinates | undefined,
  map: MapInstance
) => {
  if (!unit.hasAbility(AbilityName.DASH) || Dash.isEnabled(unit)) {
    return false;
  }

  if (coordinates) {
    const plusOne = Coordinates.plusDirection(unit.getCoordinates(), unit.getDirection());
    const plusTwo = Coordinates.plusDirection(plusOne, unit.getDirection());
    return (
      map.contains(plusOne) &&
      map.contains(plusTwo) &&
      !isBlocked(plusOne, map) &&
      !isBlocked(plusTwo, map) &&
      Coordinates.equals(coordinates, plusTwo)
    );
  }
  return false;
};

export const isInVisionRange = (unit: Unit, target: Unit): boolean => {
  const aiParameters = checkNotNull(unit.getAiParameters());
  const { visionRange } = aiParameters;
  const distanceToTarget = hypotenuse(unit.getCoordinates(), target.getCoordinates());
  return distanceToTarget <= visionRange;
};

export const hasEnemyUnit = (unit: Unit, coordinates: Coordinates): boolean => {
  const map = unit.getMap();
  const targetUnit = map.getUnit(coordinates);
  return !!targetUnit && targetUnit.getFaction() !== unit.getFaction();
};
