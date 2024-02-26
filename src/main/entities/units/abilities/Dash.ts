import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { sleep } from '../../../utils/promises';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '../../../actions/moveUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { isBlocked } from '../../../maps/MapUtils';

const manaCost = 4;

export const Dash: UnitAbility = {
  name: AbilityName.DASH,
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
    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
        await moveUnit(unit, { x, y }, session, state);
        moved = true;
        if (map.isTileRevealed({ x, y })) {
          await sleep(100);
        }
      } else {
        break;
      }
    }

    if (moved) {
      unit.spendMana(manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
