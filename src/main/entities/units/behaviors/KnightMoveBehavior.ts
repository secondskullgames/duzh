import Unit from '@main/entities/units/Unit';
import Coordinates from '@lib/geometry/Coordinates';
import Direction from '@main/geometry/Direction';
import { isBlocked } from '@main/maps/MapUtils';
import { isEmpty } from '@lib/utils/arrays';
import { randChoice } from '@lib/utils/random';
import { SpellOrder } from '@main/entities/units/orders/SpellOrder';
import { UnitBehavior } from '@main/entities/units/behaviors/UnitBehavior';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import UnitOrder from '@main/entities/units/orders/UnitOrder';
import StayOrder from '@main/entities/units/orders/StayOrder';
import { DragonTeleport } from '@main/entities/units/abilities/DragonTeleport';

export default class KnightMoveBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const canTeleport = unit.getMana() >= DragonTeleport.manaCost;
    if (canTeleport) {
      const targets = _getKnightMoveTargets(unit);
      if (!isEmpty(targets)) {
        const target = randChoice(targets);
        return new SpellOrder({
          coordinates: target,
          ability: DragonTeleport
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
