import { UnitController } from './UnitController';
import { canMove, getNearestEnemyUnit } from './ControllerUtils';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import { SpellOrder } from '../orders/SpellOrder';
import MapInstance from '@main/maps/MapInstance';
import { AbilityName } from '@main/abilities/AbilityName';
import { Summon } from '@main/abilities/Summon';
import { range as TELEPORT_RANGE, Teleport } from '@main/abilities/Teleport';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { hypotenuse, manhattanDistance } from '@lib/geometry/CoordinatesUtils';
import { getUnitsOfClass, isBlocked } from '@main/maps/MapUtils';
import { randChance } from '@lib/utils/random';
import { maxBy } from '@lib/utils/arrays';
import { checkNotNull } from '@lib/utils/preconditions';

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
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const closestEnemyUnit = getNearestEnemyUnit(unit);
    if (!closestEnemyUnit) {
      return new StayOrder();
    }
    const map = session.getMap();

    if (_canSummon(unit, map) && _wantsToSummon()) {
      const coordinates = _getTargetSummonCoordinates(unit);
      if (coordinates) {
        return new SpellOrder({ ability: Summon, coordinates });
      }
    }

    if (_canTeleport(unit) && _wantsToTeleport(unit, closestEnemyUnit)) {
      const coordinates = _getTargetTeleportCoordinates(unit);
      if (coordinates) {
        return new SpellOrder({ ability: Teleport, coordinates });
      }
    }

    if (!canMove(unit)) {
      return new StayOrder();
    }

    const behavior = randChance(avoidChance)
      ? new AvoidUnitBehavior({ targetUnit: closestEnemyUnit })
      : new WanderBehavior();
    return behavior.issueOrder(unit, state, session);
  };
}

const _canSummon = (unit: Unit, map: MapInstance): boolean => {
  const summonedUnitClass = checkNotNull(unit.getSummonedUnitClass());
  return (
    unit.hasAbility(AbilityName.SUMMON) &&
    unit.getMana() >= Summon.manaCost &&
    getUnitsOfClass(map, summonedUnitClass).length <= maxSummonedUnits
  );
};

const _getTargetSummonCoordinates = (unit: Unit): Coordinates | null => {
  const map = unit.getMap();
  const targetCoordinates = Direction.values()
    .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
    .find(coordinates => map.contains(coordinates) && !isBlocked(map, coordinates));
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
  return unit.hasAbility(AbilityName.TELEPORT) && unit.getMana() >= Teleport.manaCost;
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
      if (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
        if (hypotenuse(unit.getCoordinates(), { x, y }) <= TELEPORT_RANGE) {
          tiles.push({ x, y });
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
