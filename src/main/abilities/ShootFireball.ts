import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { shootFireball } from '@main/actions/shootFireball';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Engine } from '@main/core/Engine';

const damage = 20;

export class ShootFireball implements UnitAbility {
  readonly name = AbilityName.SHOOT_FIREBALL;
  readonly icon = 'icon6';
  readonly manaCost = 25;
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = () => true;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFireball(unit, direction, damage, session, state);
  };
}
