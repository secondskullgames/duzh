import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { shootFirebolt } from '@main/actions/shootFirebolt';

const manaCost = 10;
const damage = 10;
const burnDuration = 5;

export const ShootFirebolt: UnitAbility = {
  name: AbilityName.SHOOT_FIREBOLT,
  icon: 'harpoon_icon',
  manaCost: manaCost,
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(manaCost);
    await shootFirebolt(unit, direction, damage, burnDuration, session, state);
  }
};
