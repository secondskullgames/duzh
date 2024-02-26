import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { moveUnit } from '../../../actions/moveUnit';
import Sounds from '../../../sounds/Sounds';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { isBlocked } from '../../../maps/MapUtils';

const manaCost = 4;

export const FreeMove: UnitAbility = {
  name: AbilityName.FREE_MOVE,
  manaCost,
  icon: 'icon5',
  innate: false,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    const targetCoordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    if (!isBlocked(map, targetCoordinates)) {
      await moveUnit(unit, targetCoordinates, session, state);
      unit.spendMana(manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
