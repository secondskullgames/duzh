import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { moveUnit } from '../../../actions/moveUnit';
import Sounds from '../../../sounds/Sounds';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

export class FreeMove implements UnitAbility {
  readonly name = AbilityName.FREE_MOVE;
  readonly manaCost = 4;
  readonly icon = 'icon5';

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('FreeMove requires a target!');
    }

    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    const { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    if (!map.isBlocked({ x, y })) {
      await moveUnit(unit, { x, y }, session, state);
      unit.spendMana(this.manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  };
}
