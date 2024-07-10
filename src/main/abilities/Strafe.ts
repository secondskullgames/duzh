import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { isBlocked } from '@main/maps/MapUtils';
import { Engine } from '@main/core/Engine';

export class Strafe implements UnitAbility {
  readonly name = AbilityName.STRAFE;
  readonly manaCost = 0;
  readonly icon = null;
  readonly innate = true;

  constructor(private readonly engine: Engine) {}

  isEnabled = () => true;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = session.getMap();
    if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      await moveUnit(unit, coordinates, session, state);
    }
  };
}
