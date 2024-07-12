import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { Activity } from '@main/units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { sleep } from '@lib/utils/promises';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { hypotenuse, pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';

export const range = 3;
const manaCost = 20;

export const Teleport: UnitAbility = {
  name: AbilityName.TELEPORT,
  icon: null,
  manaCost,
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  isLegal: (unit, coordinates) => {
    return (
      !isBlocked(coordinates, unit.getMap()) &&
      hypotenuse(unit.getCoordinates(), coordinates) <= range
    );
  },
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = unit.getMap();

    const maybeSleep = async () => {
      if (map.isTileRevealed(coordinates)) {
        await sleep(100);
      }
    };

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(coordinates, map)) {
      unit.spendMana(manaCost);
      state.getSoundPlayer().playSound(Sounds.WIZARD_VANISH);

      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.VANISHING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      await maybeSleep();

      await moveUnit(unit, coordinates, session, state);
      await maybeSleep();

      state.getSoundPlayer().playSound(Sounds.WIZARD_APPEAR);
      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.APPEARING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
