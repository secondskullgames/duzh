import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { shootFireball } from '../../../actions/shootFireball';
import { pointAt } from '../../../utils/geometry';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

const DAMAGE = 20;

export class ShootFireball implements UnitAbility {
  readonly name = AbilityName.SHOOT_FIREBALL;
  readonly icon = 'icon6';
  readonly manaCost = 25;

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('ShootFireball requires a target!');
    }
    const direction = pointAt(unit.getCoordinates(), coordinates);

    unit.spendMana(this.manaCost);
    await shootFireball(unit, direction, DAMAGE, session, state);
  };
}
