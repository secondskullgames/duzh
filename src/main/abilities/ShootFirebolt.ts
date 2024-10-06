import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { shootFirebolt } from '@main/actions/shootFirebolt';

export class ShootFirebolt implements UnitAbility {
  static readonly DAMAGE = 10;
  static readonly BURN_DURATION = 5;
  readonly name = AbilityName.SHOOT_FIREBOLT;
  readonly icon = 'harpoon_icon';
  manaCost = 10;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = () => true; // TODO

  use = async (unit: Unit, coordinates: Coordinates) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFirebolt(
      unit,
      direction,
      ShootFirebolt.DAMAGE,
      ShootFirebolt.BURN_DURATION
    );
  };
}
