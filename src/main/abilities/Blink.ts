import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Feature } from '@main/utils/features';
import { isBlocked } from '@main/maps/MapUtils';
import { Engine } from '@main/core/Engine';

export class Blink implements UnitAbility {
  readonly name = AbilityName.BLINK;
  readonly manaCost = 10;
  readonly icon = 'blink_icon';
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    if (!coordinates) {
      throw new Error('Blink requires a target!');
    }

    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = unit.getMap();
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    const { x, y } = unit.getCoordinates();

    const targetCoordinates = {
      x: x + dx * distance,
      y: y + dy * distance
    };
    const blocked = this._isBlocked(unit.getCoordinates(), targetCoordinates, map);

    if (blocked) {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    } else {
      await moveUnit(unit, targetCoordinates, session, state);
      unit.spendMana(this.manaCost);
    }
  };

  private _isBlocked = (
    start: Coordinates,
    end: Coordinates,
    map: MapInstance
  ): boolean => {
    const direction = pointAt(start, end);
    let coordinates = start;
    while (!Coordinates.equals(coordinates, end)) {
      coordinates = Coordinates.plusDirection(coordinates, direction);
      if (Coordinates.equals(coordinates, end)) {
        return isBlocked(map, coordinates);
      } else if (Feature.isEnabled(Feature.BLINK_THROUGH_WALLS)) {
        // do nothing
      } else {
        return map.getTile(coordinates).isBlocking();
      }
    }
    throw new Error();
  };
}
