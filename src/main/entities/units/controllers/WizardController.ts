import { UnitController } from './UnitController';
import { canMove, getClosestEnemy } from './ControllerUtils';
import Unit from '../Unit';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { randChance } from '../../../utils/random';
import TeleportAwayOrder from '../orders/TeleportAwayOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { Teleport } from '../abilities/Teleport';
import { Summon } from '../abilities/Summon';
import { AbilityName } from '../abilities/AbilityName';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import MapInstance from '../../../maps/MapInstance';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import StayOrder from '../orders/StayOrder';
import { manhattanDistance } from '../../../geometry/CoordinatesUtils';

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
    const closestEnemyUnit = getClosestEnemy(unit);
    const map = session.getMap();

    if (_canSummon(unit, map) && _wantsToSummon()) {
      const coordinates = _getTargetSummonCoordinates(unit);
      if (coordinates) {
        return new AbilityOrder({ ability: Summon, coordinates });
      }
    }

    if (_canTeleport(unit) && _wantsToTeleport(unit, closestEnemyUnit)) {
      return new TeleportAwayOrder({ targetUnit: closestEnemyUnit });
    }

    if (!canMove(unit, session)) {
      return new StayOrder();
    }

    const behavior = randChance(avoidChance)
      ? new AvoidUnitBehavior({ targetUnit: closestEnemyUnit })
      : new WanderBehavior();
    return behavior.issueOrder(unit, state, session);
  };
}

const _canSummon = (unit: Unit, map: MapInstance): boolean => {
  return (
    unit.hasAbility(AbilityName.SUMMON) &&
    unit.getMana() >= Summon.manaCost &&
    _countUnits(map, unit.getSummonedUnitClass()!) <= maxSummonedUnits
  );
};

const _countUnits = (map: MapInstance, unitClass: string): number => {
  return map.getAllUnits().filter(unit => unit.getUnitClass() === unitClass).length;
};

const _getTargetSummonCoordinates = (unit: Unit): Coordinates | null => {
  const map = unit.getMap();
  const targetCoordinates = Direction.values()
    .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
    .find(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates));
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
