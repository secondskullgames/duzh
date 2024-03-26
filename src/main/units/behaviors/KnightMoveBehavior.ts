import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Direction } from '@lib/geometry/Direction';
import { isBlocked } from '@main/maps/MapUtils';
import { isEmpty } from '@lib/utils/arrays';
import { randChoice } from '@lib/utils/random';
import { SpellOrder } from '@main/units/orders/SpellOrder';
import { UnitBehavior } from '@main/units/behaviors/UnitBehavior';
import UnitOrder from '@main/units/orders/UnitOrder';
import StayOrder from '@main/units/orders/StayOrder';
import { FastTeleport } from '@main/abilities/FastTeleport';

export default class KnightMoveBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit): UnitOrder => {
    const canTeleport = unit.getMana() >= FastTeleport.manaCost;
    if (canTeleport) {
      const targets = _getKnightMoveTargets(unit);
      if (!isEmpty(targets)) {
        const target = randChoice(targets);
        return new SpellOrder({
          coordinates: target,
          ability: FastTeleport
        });
      }
    }
    return new StayOrder();
  };
}

const _getKnightMoveTargets = (unit: Unit): Coordinates[] => {
  const paths = [
    [Direction.N, Direction.N, Direction.W],
    [Direction.N, Direction.N, Direction.E],
    [Direction.E, Direction.E, Direction.N],
    [Direction.E, Direction.E, Direction.S],
    [Direction.S, Direction.S, Direction.E],
    [Direction.S, Direction.S, Direction.W],
    [Direction.W, Direction.W, Direction.S],
    [Direction.W, Direction.W, Direction.N]
  ];

  const map = unit.getMap();
  const targets: Coordinates[] = [];
  for (const path of paths) {
    let coordinates = unit.getCoordinates();
    for (const direction of path) {
      coordinates = Coordinates.plus(coordinates, direction);
    }
    if (!isBlocked(map, coordinates)) {
      targets.push(coordinates);
    }
  }
  return targets;
};
