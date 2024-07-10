import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { shootFireball } from '@main/actions/shootFireball';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

const damage = 20;

export class ShootFireball implements UnitAbility {
  readonly name = AbilityName.SHOOT_FIREBALL;
  readonly icon = 'icon6';
  readonly manaCost = 25;
  readonly innate = false;

  isEnabled = () => true;

  use = async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFireball(unit, direction, damage, session, state);
  };
}
