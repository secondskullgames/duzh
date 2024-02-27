import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import { NormalAttack } from '../abilities/NormalAttack';
import { walk } from '@main/actions/walk';
import { openDoor } from '@main/actions/openDoor';
import { pushBlock } from '@main/actions/pushBlock';
import { attackObject } from '@main/actions/attackObject';
import { getDoor, getMovableBlock, getSpawner, isBlocked } from '@main/maps/MapUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { Coordinates, Direction } from '@main/geometry';

type Props = Readonly<{
  direction: Direction;
}>;

/**
 * An order in which the unit moves in the specified direction,
 * or attacks a target if one is present.
 */
export class AttackMoveOrder implements UnitOrder {
  private readonly direction: Direction;

  constructor({ direction }: Props) {
    this.direction = direction;
  }

  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    const map = session.getMap();
    const { direction } = this;
    unit.setDirection(direction);
    const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!isBlocked(map, coordinates)) {
        await walk(unit, direction, session, state);
        return;
      } else {
        await this._attackTile(unit, coordinates, session, state);
      }
    }
  };

  private _attackTile = async (
    unit: Unit,
    targetCoordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = unit.getMap();
    const targetUnit = map.getUnit(targetCoordinates);
    if (targetUnit) {
      await NormalAttack.use(unit, targetCoordinates, session, state);
      return;
    }
    const door = getDoor(map, targetCoordinates);
    if (door) {
      await openDoor(unit, door, state);
      return;
    }

    const spawner = getSpawner(map, targetCoordinates);
    if (spawner && spawner.isBlocking()) {
      await attackObject(unit, spawner, state);
    }

    const block = getMovableBlock(map, targetCoordinates);
    if (block) {
      await pushBlock(unit, block, session, state);
      return;
    }
  };
}
