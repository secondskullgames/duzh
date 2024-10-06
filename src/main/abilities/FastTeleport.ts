import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { Activity } from '@main/units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';
import { Globals } from '@main/core/globals';

export class FastTeleport implements UnitAbility {
  static readonly MANA_COST = 4;
  readonly name = AbilityName.FAST_TELEPORT;
  readonly icon = null;
  manaCost = FastTeleport.MANA_COST;
  readonly innate = false;
  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  /**
   * Note: We don't check range here, it's currently only controlled
   * by the Behavior
   */
  isLegal = (unit: Unit, coordinates: Coordinates) => {
    const map = unit.getMap();
    return map.contains(coordinates) && !isBlocked(coordinates, map);
  };

  use = async (unit: Unit, coordinates: Coordinates) => {
    const { soundPlayer } = Globals;
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    unit.spendMana(this.manaCost);
    await moveUnit(unit, coordinates);
    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    soundPlayer.playSound(Sounds.FOOTSTEP);
  };
}
