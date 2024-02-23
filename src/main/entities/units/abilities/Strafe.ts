import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { moveUnit } from '../../../actions/moveUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

export class Strafe implements UnitAbility {
  readonly name = AbilityName.STRAFE;
  readonly manaCost = 0;
  readonly icon = null;

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }

    const map = session.getMap();
    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, session, state);
    }
  };
}
