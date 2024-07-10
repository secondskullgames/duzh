import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { shootFrostbolt } from '@main/actions/shootFrostbolt';

const damage = 10;
const freezeDuration = 5;

export class ShootFrostbolt implements UnitAbility {
  readonly name = AbilityName.SHOOT_FROSTBOLT;
  readonly icon = 'harpoon_icon';
  readonly manaCost = 10;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFrostbolt(unit, direction, damage, freezeDuration, session, state);
  };
}
