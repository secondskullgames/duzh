import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import { range as teleportRange } from '@main/abilities/Teleport';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { maxBy } from '@lib/utils/arrays';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { manhattanDistance, pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';
import { AttackMoveBehavior } from '@main/units/behaviors/AttackMoveBehavior';
import { UnitAbility } from '@main/abilities/UnitAbility';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class AvoidUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;
    if (_canTeleport(unit)) {
      const targetCoordinates = this._getTargetTeleportCoordinates(unit, targetUnit);
      if (targetCoordinates) {
        const direction = pointAt(unit.getCoordinates(), targetCoordinates);
        const teleportAbility = UnitAbility.abilityForName(AbilityName.TELEPORT);
        return new AbilityOrder({ direction, ability: teleportAbility });
      }
    }

    const targetCoordinates = this._getTargetWalkCoordinates(unit, targetUnit);
    if (targetCoordinates) {
      const direction = pointAt(unit.getCoordinates(), targetCoordinates);
      return new AttackMoveBehavior({ direction }).issueOrder(unit, state, session);
    }
    return new StayOrder();
  };

  private _getTargetTeleportCoordinates = (unit: Unit, closestEnemyUnit: Unit) => {
    const map = unit.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
      if (map.contains(coordinates)) {
        if (!isBlocked(map, coordinates)) {
          tiles.push(coordinates);
        }
      }
    }
    const possibleCoordinates = tiles
      .filter(coordinates => manhattanDistance(unit.getCoordinates(), coordinates) >= 3)
      .filter(
        coordinates =>
          manhattanDistance(unit.getCoordinates(), coordinates) <= teleportRange
      );
    if (possibleCoordinates.length > 0) {
      return maxBy(possibleCoordinates, coordinates =>
        manhattanDistance(coordinates, closestEnemyUnit.getCoordinates())
      );
    }
    return null;
  };

  private _getTargetWalkCoordinates = (
    unit: Unit,
    targetUnit: Unit
  ): Coordinates | null => {
    const map = unit.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
      if (map.contains(coordinates)) {
        if (!isBlocked(map, coordinates)) {
          tiles.push(coordinates);
        }
      }
    }

    if (tiles.length === 0) {
      return null;
    }
    return maxBy(tiles, coordinates =>
      manhattanDistance(coordinates, targetUnit.getCoordinates())
    );
  };
}

/**
 * TODO does not account for FastTeleport
 */
const _canTeleport = (unit: Unit): boolean => {
  const teleportAbility = UnitAbility.abilityForName(AbilityName.TELEPORT);
  return (
    unit.hasAbility(AbilityName.TELEPORT) && unit.getMana() >= teleportAbility.manaCost
  );
};
