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

const manaCost = 8;

export const Dash: UnitAbility = {
  name: AbilityName.DASH,
  manaCost,
  icon: 'icon5',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Dash requires a target!');
    }

    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
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
