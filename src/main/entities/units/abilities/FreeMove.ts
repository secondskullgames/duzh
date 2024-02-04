import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { moveUnit } from '../../../actions/moveUnit';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

const manaCost = 4;

export const FreeMove: UnitAbility = {
  name: AbilityName.FREE_MOVE,
  manaCost,
  icon: 'icon5',
  use: async (
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
      unit.spendMana(manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  }
};
