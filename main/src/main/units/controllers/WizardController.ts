import { UnitController } from './UnitController';
import { canMove, getNearestEnemyUnit } from './ControllerUtils';
import { AvoidNearestEnemyBehavior } from '../behaviors/AvoidNearestEnemyBehavior';
import { WanderBehavior } from '../behaviors/WanderBehavior';
import { SpellOrder } from '../orders/SpellOrder';
import MapInstance from '@main/maps/MapInstance';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { hypotenuse, manhattanDistance } from '@lib/geometry/CoordinatesUtils';
import { getUnitsOfClass, isBlocked } from '@main/maps/MapUtils';
import { randChance } from '@duzh/utils/random';
import { maxBy } from '@duzh/utils/arrays';
import { checkNotNull } from '@duzh/utils/preconditions';
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { StayOrder } from '@main/units/orders/StayOrder';
import { Teleport } from '@main/abilities/Teleport';

const maxSummonedUnits = 3;
const summonChance = 0.2;
const avoidChance = 0.75;
const teleportChance = 0.5;
const teleportMinDistance = 3;

export default class WizardController implements UnitController {
  /**
   * If we have mana to Summon, and X% chance, cast Summon;
   * if we have mana to Teleport, and player is within X tiles, cast Teleport;
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit): UnitOrder => {
    const closestEnemyUnit = getNearestEnemyUnit(unit);
    if (!closestEnemyUnit) {
      return StayOrder.create();
    }
    const map = unit.getMap();

    if (_canSummon(unit, map) && _wantsToSummon()) {
      const ability = unit.getAbilityForName(AbilityName.SUMMON);
      const coordinates = _getTargetSummonCoordinates(unit);
      if (coordinates) {
        return SpellOrder.create({ ability, coordinates });
      }
    }

    if (_canTeleport(unit) && _wantsToTeleport(unit, closestEnemyUnit)) {
      const ability = unit.getAbilityForName(AbilityName.TELEPORT);
      const coordinates = _getTargetTeleportCoordinates(unit);
      if (coordinates) {
        return SpellOrder.create({ ability, coordinates });
      }
    }

    if (!canMove(unit)) {
      return StayOrder.create();
    }

    const behavior = randChance(avoidChance)
      ? new AvoidNearestEnemyBehavior()
      : new WanderBehavior();
    return behavior.issueOrder(unit);
  };
}

const _canSummon = (unit: Unit, map: MapInstance): boolean => {
  const summonedUnitClass = checkNotNull(unit.getSummonedUnitClass());
  if (unit.hasAbility(AbilityName.SUMMON)) {
    const ability = unit.getAbilityForName(AbilityName.SUMMON);
    return (
      unit.getMana() >= ability.manaCost &&
      getUnitsOfClass(map, summonedUnitClass).length <= maxSummonedUnits
    );
  }
  return false;
};

const _getTargetSummonCoordinates = (unit: Unit): Coordinates | null => {
  const map = unit.getMap();
  const targetCoordinates = Direction.values()
    .map(direction => Coordinates.plusDirection(unit.getCoordinates(), direction))
    .find(coordinates => map.contains(coordinates) && !isBlocked(coordinates, map));
  return targetCoordinates ?? null;
};

const _wantsToTeleport = (unit: Unit, closestEnemyUnit: Unit) => {
  const distanceToEnemyUnit = manhattanDistance(
    unit.getCoordinates(),
    closestEnemyUnit.getCoordinates()
  );
  return distanceToEnemyUnit <= teleportMinDistance && randChance(teleportChance);
};

const _canTeleport = (unit: Unit) => {
  if (unit.hasAbility(AbilityName.TELEPORT)) {
    const ability = unit.getAbilityForName(AbilityName.TELEPORT);
    return unit.getMana() >= ability.manaCost;
  }
  return false;
};

const _wantsToSummon = () => {
  return randChance(summonChance);
};

const _getTargetTeleportCoordinates = (unit: Unit): Coordinates | null => {
  const closestEnemyUnit = getNearestEnemyUnit(unit);
  if (!closestEnemyUnit) {
    return null;
  }
  const map = unit.getMap();
  const tiles: Coordinates[] = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const coordinates = { x, y };
      if (map.contains(coordinates) && !isBlocked(coordinates, map)) {
        if (hypotenuse(unit.getCoordinates(), coordinates) <= Teleport.RANGE) {
          tiles.push(coordinates);
        }
      }
    }
  }

  if (tiles.length > 0) {
    return maxBy(tiles, coordinates =>
      manhattanDistance(coordinates, closestEnemyUnit.getCoordinates())
    );
  }
  return null;
};
