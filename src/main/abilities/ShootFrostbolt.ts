import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { shootFrostbolt } from '@main/actions/shootFrostbolt';
import { Engine } from '@main/core/Engine';

const damage = 10;
const freezeDuration = 5;

export class ShootFrostbolt implements UnitAbility {
  readonly name = AbilityName.SHOOT_FROSTBOLT;
  readonly icon = 'harpoon_icon';
  readonly manaCost = 10;
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFrostbolt(unit, direction, damage, freezeDuration, session, state);
  };
}
