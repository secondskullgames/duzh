import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { moveUnit } from '../../../actions/moveUnit';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';

const manaCost = 4;

export const FreeMove: UnitAbility = {
  name: AbilityName.FREE_MOVE,
  manaCost,
  icon: 'icon5',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, session }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('FreeMove requires a target!');
    }

    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    const { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    if (!map.isBlocked({ x, y })) {
      await moveUnit(unit, { x, y }, { state, map, session });
      unit.spendMana(manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  }
};
