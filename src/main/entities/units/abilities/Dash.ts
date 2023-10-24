import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { sleep } from '../../../utils/promises';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';

const manaCost = 5;

export const Dash: UnitAbility = {
  name: AbilityName.DASH,
  manaCost,
  icon: 'icon5',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { game, map, imageFactory, ticker }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('Dash requires a target!');
    }

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
        await moveUnit(
          unit,
          { x, y },
          { game, map, imageFactory, ticker }
        );
        moved = true;
        await sleep(75);
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