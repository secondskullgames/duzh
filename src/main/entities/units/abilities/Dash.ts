import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { sleep } from '../../../utils/promises';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';
import { GlobalContext } from '../../../core/GlobalContext';

const manaCost = 10;

export const Dash: UnitAbility = {
  name: AbilityName.DASH,
  manaCost,
  icon: 'icon5',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    context: GlobalContext
  ) => {
    if (!coordinates) {
      throw new Error('Dash requires a target!');
    }

    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    const map = context.state.getMap();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
        await moveUnit(
          unit,
          { x, y },
          context
        );
        moved = true;
        await sleep(50);
      } else {
        break;
      }
    }

    if (moved) {
      unit.spendMana(manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  }
}