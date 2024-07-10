import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import Activity from '@main/units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { sleep } from '@lib/utils/promises';
import { hypotenuse, pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';
import { Engine } from '@main/core/Engine';

export const range = 3;

export class Teleport implements UnitAbility {
  readonly name = AbilityName.TELEPORT;
  readonly icon = null;
  readonly manaCost = 20;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  constructor(private readonly engine: Engine) {}

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (hypotenuse(unit.getCoordinates(), coordinates) > range) {
      throw new Error(`Can't teleport more than ${range} units`);
    }

    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = session.getMap();

    const maybeSleep = async () => {
      if (map.isTileRevealed(coordinates)) {
        await sleep(100);
      }
    };

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      unit.spendMana(this.manaCost);
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
  };
}
