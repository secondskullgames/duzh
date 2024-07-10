import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import Activity from '@main/units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';
import { Engine } from '@main/core/Engine';

export class FastTeleport implements UnitAbility {
  readonly name = AbilityName.FAST_TELEPORT;
  readonly icon = null;
  readonly manaCost = 4;
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('FastTeleport requires a target!');
    }

    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = unit.getMap();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      unit.spendMana(this.manaCost);
      await moveUnit(unit, coordinates, session, state);
      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  };
}
