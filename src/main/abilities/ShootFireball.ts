import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { shootFireball } from '@main/actions/shootFireball';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

const manaCost = 25;
const damage = 20;

export const ShootFireball: UnitAbility = {
  name: AbilityName.SHOOT_FIREBALL,
  icon: 'icon6',
  manaCost,
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  isLegal: () => true, // TODO
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(manaCost);
    await shootFireball(unit, direction, damage, session, state);
  }
};
