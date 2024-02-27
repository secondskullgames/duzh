import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import { shootFireball } from '@main/actions/shootFireball';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { Coordinates, pointAt } from '@main/geometry';

const MANA_COST = 25;
const DAMAGE = 20;

export const ShootFireball: UnitAbility = {
  name: AbilityName.SHOOT_FIREBALL,
  icon: 'icon6',
  manaCost: MANA_COST,
  innate: false,

  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(MANA_COST);
    await shootFireball(unit, direction, DAMAGE, session, state);
  }
};
