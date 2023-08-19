import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { manhattanDistance } from '../../../maps/MapUtils';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';
import Activity from '../Activity';
import { sleep } from '../../../utils/promises';

export const range = 3;
const manaCost = 20;

export const Teleport: UnitAbility = {
  name: AbilityName.TELEPORT,
  icon: null,
  manaCost,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, spriteFactory, animationFactory, itemFactory, unitFactory, objectFactory, ticker }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (manhattanDistance(unit.getCoordinates(), coordinates) > range) {
      throw new Error(`Can't teleport more than ${range} units`);
    }

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      unit.spendMana(manaCost);
      playSound(Sounds.WIZARD_VANISH);

      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.VANISHING, i, unit.getDirection());
        await sleep(100);
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      await sleep(100);

      await moveUnit(
        unit,
        coordinates,
        { state, map, spriteFactory, animationFactory, itemFactory, unitFactory, objectFactory, ticker }
      );
      await sleep(100);

      for (let i = 1; i <= 4; i++) {
        if (i === 1) {
          playSound(Sounds.WIZARD_APPEAR);
        }
        unit.setActivity(Activity.APPEARING, i, unit.getDirection());
        await sleep(100);
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    } else {
      playSound(Sounds.BLOCKED);
    }
  }
}