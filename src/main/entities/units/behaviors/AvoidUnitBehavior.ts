import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import { AttackMoveOrder } from '../orders/AttackMoveOrder';
import { AbilityName } from '../abilities/AbilityName';
import { Teleport, range as teleportRange } from '../abilities/Teleport';
import { AbilityOrder } from '../orders/AbilityOrder';
import { maxBy } from '@main/utils/arrays';
import { GameState, Session } from '@main/core';
import { manhattanDistance, pointAt, Coordinates, Direction } from '@main/geometry';
import { isBlocked } from '@main/maps/MapUtils';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class AvoidUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueOrder = (unit: Unit, _: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;
    if (_canTeleport(unit)) {
      const targetCoordinates = this._getTargetTeleportCoordinates(unit, targetUnit);
      if (targetCoordinates) {
        const direction = pointAt(unit.getCoordinates(), targetCoordinates);
        return new AbilityOrder({ direction, ability: Teleport });
      }
    }

    const targetCoordinates = this._getTargetWalkCoordinates(unit, targetUnit);
    if (targetCoordinates) {
      const direction = pointAt(unit.getCoordinates(), targetCoordinates);
      return new AttackMoveOrder({ direction });
    }
    return new StayOrder();
  };

  private _getTargetTeleportCoordinates = (unit: Unit, closestEnemyUnit: Unit) => {
    const map = unit.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
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
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
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

const _canTeleport = (unit: Unit): boolean => {
  return unit.hasAbility(AbilityName.TELEPORT) && unit.getMana() >= Teleport.manaCost;
};
