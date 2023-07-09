import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { sleep } from '../../../utils/promises';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';
import { Feature } from '../../../utils/features';

const manaCost = 5;

export const Dash: UnitAbility = {
  name: AbilityName.DASH,
  manaCost,
  icon: 'icon5',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, imageFactory, ticker }: UnitAbilityContext
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
      const coordinates = { x, y };
      if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
        await moveUnit(
          unit,
          coordinates,
          { state, map, imageFactory, ticker }
        );
        moved = true;
        await sleep(100);
      } else if (
        Feature.isEnabled(Feature.DASH_KNOCKBACK)
        && map.contains(coordinates)
        && !map.getTile(coordinates).isBlocking()
      ) {
        const unitToKnockBack = map.getUnit(coordinates);
        if (unitToKnockBack) {
          const next = Coordinates.plus(coordinates, { dx, dy });
          if (map.contains(next) && !map.isBlocked(next)) {
            await moveUnit(unitToKnockBack, next, { state, map, imageFactory, ticker });
            await moveUnit(unit, coordinates, { state, map, imageFactory, ticker });
            await sleep(100);
          }
        }
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