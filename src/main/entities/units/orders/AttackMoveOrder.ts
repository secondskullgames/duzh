import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { UnitAbility } from '../abilities/UnitAbility';
import { pointAt } from '../../../utils/geometry';
import { walk } from '../../../actions/walk';
import { openDoor } from '../../../actions/openDoor';
import { pushBlock } from '../../../actions/pushBlock';
import { attackObject } from '../../../actions/attackObject';
import { getDoor, getMovableBlock, getSpawner } from '../../../maps/MapUtils';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';

type Props = Readonly<{
  coordinates: Coordinates;
  ability: UnitAbility;
}>;

export class AttackMoveOrder implements UnitOrder {
  private readonly coordinates: Coordinates;
  private readonly ability: UnitAbility;

  constructor({ coordinates, ability }: Props) {
    this.coordinates = coordinates;
    this.ability = ability;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    const map = session.getMap();
    const { coordinates, ability } = this;
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, session, state);
        return;
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          await ability.use(unit, coordinates, session, state);
          return;
        }
        const door = getDoor(map, coordinates);
        if (door) {
          await openDoor(unit, door, state);
          return;
        }

        const spawner = getSpawner(map, coordinates);
        if (spawner && spawner.isBlocking()) {
          await attackObject(unit, spawner, state);
        }

        const block = getMovableBlock(map, coordinates);
        if (block) {
          await pushBlock(unit, block, session, state);
          return;
        }
      }
    }
  };
}
