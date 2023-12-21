import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '../../../actions/moveUnit';

const manaCost = 10;

export const Blink: UnitAbility = {
  name: AbilityName.BLINK,
  manaCost,
  icon: 'blink_icon',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, imageFactory, session }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('Blink requires a target!');
    }

    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
    }
    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveUnit(unit, { x, y }, { state, map, imageFactory, session });
      moved = true;
    }

    if (moved) {
      unit.spendMana(manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  }
};
