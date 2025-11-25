import Unit from '@main/units/Unit';
import { Coordinates } from '@duzh/geometry';
import { Direction } from '@duzh/geometry';
import { isBlocked } from '@main/maps/MapUtils';
import { isEmpty } from '@duzh/utils/arrays';
import { randChoice } from '@duzh/utils/random';
import { SpellOrder } from '@main/units/orders/SpellOrder';
import { UnitBehavior } from '@main/units/behaviors/UnitBehavior';
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { StayOrder } from '@main/units/orders/StayOrder';
import { AbilityName } from '@main/abilities/AbilityName';

export class KnightMoveBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit): UnitOrder => {
    const ability = unit.getAbilityForName(AbilityName.FAST_TELEPORT);
    const canTeleport = unit.getMana() >= ability.manaCost;
    if (canTeleport) {
      const targets = _getKnightMoveTargets(unit);
      if (!isEmpty(targets)) {
        const target = randChoice(targets);
        return SpellOrder.create({ coordinates: target, ability });
      }
    }
    return StayOrder.create();
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
      coordinates = Coordinates.plusDirection(coordinates, direction);
    }
    if (!isBlocked(coordinates, map)) {
      targets.push(coordinates);
    }
  }
  return targets;
};
