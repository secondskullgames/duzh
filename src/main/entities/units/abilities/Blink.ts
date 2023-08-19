import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';

const manaCost = 10;

export const Blink: UnitAbility = {
  name: AbilityName.BLINK,
  manaCost,
  icon: 'blink_icon',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, spriteFactory, animationFactory, itemFactory, unitFactory, ticker }: UnitAbilityContext
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
      await moveUnit(
        unit,
        { x, y },
        { state, map, spriteFactory, animationFactory, itemFactory, unitFactory, ticker }
      );
      moved = true;
    }

    if (moved) {
      unit.spendMana(manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  }
}