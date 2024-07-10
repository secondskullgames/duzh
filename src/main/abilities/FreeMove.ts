import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { isBlocked } from '@main/maps/MapUtils';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Engine } from '@main/core/Engine';

export class FreeMove implements UnitAbility {
  readonly name = AbilityName.FREE_MOVE;
  readonly manaCost = 4;
  readonly icon = 'icon5';
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    const targetCoordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    if (!isBlocked(map, targetCoordinates)) {
      await moveUnit(unit, targetCoordinates, session, state);
      unit.spendMana(this.manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  };
}
