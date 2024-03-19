import UnitOrder from './UnitOrder';
import Unit from '@main/units/Unit';
import { NormalAttack } from '@main/abilities/NormalAttack';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { attackObject } from '@main/actions/attackObject';
import { getSpawner } from '@main/maps/MapUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { check } from '@lib/utils/preconditions';

type Props = Readonly<{
  direction: Direction;
}>;

/**
 * An order in which the unit moves in the specified direction,
 * or attacks a target if one is present.
 */
export class AttackOrder implements UnitOrder {
  private readonly direction: Direction;

  constructor({ direction }: Props) {
    this.direction = direction;
  }

  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    const map = unit.getMap();
    const { direction } = this;
    unit.setDirection(direction);
    const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    check(map.contains(coordinates));

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await NormalAttack.use(unit, coordinates, session, state);
      return;
    }

    const spawner = getSpawner(map, coordinates);
    if (spawner && spawner.isBlocking()) {
      await attackObject(unit, spawner, state);
    }
  };
}
