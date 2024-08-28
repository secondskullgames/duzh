import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';

export class Strafe implements UnitAbility {
  readonly name = AbilityName.STRAFE;
  manaCost = 0;
  readonly icon = null;
  readonly innate = true;

  isEnabled = () => true;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return !isBlocked(coordinates, unit.getMap());
  };

  use = async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    if (map.contains(coordinates) && !isBlocked(coordinates, map)) {
      await moveUnit(unit, coordinates, session, state);
    }
  };
}
