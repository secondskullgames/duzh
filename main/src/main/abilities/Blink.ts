import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Feature } from '@main/utils/features';
import { isBlocked } from '@main/maps/MapUtils';
import { checkState } from '@duzh/utils/preconditions';
import { Direction } from '@lib/geometry/Direction';
import { Game } from '@main/core/Game';

export class Blink implements UnitAbility {
  static readonly MANA_COST = 10;
  static readonly DISTANCE = 2;
  readonly name = AbilityName.BLINK;
  manaCost = Blink.MANA_COST;
  readonly icon = 'blink_icon';
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    const map = unit.getMap();
    return !_isBlocked(unit.getCoordinates(), coordinates, map);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const map = unit.getMap();
    const direction = Direction.between(unit.getCoordinates(), coordinates);

    unit.setDirection(direction);

    const { dx, dy } = Direction.getOffsets(direction);
    const targetCoordinates = Coordinates.plus(unit.getCoordinates(), {
      dx: Blink.DISTANCE * dx,
      dy: Blink.DISTANCE * dy
    });
    const blocked = _isBlocked(unit.getCoordinates(), targetCoordinates, map);
    checkState(!blocked);

    await moveUnit(unit, targetCoordinates, game);
    unit.spendMana(this.manaCost);
  };
}

const _isBlocked = (start: Coordinates, end: Coordinates, map: MapInstance): boolean => {
  const direction = pointAt(start, end);
  let coordinates = start;
  while (!Coordinates.equals(coordinates, end)) {
    coordinates = Coordinates.plusDirection(coordinates, direction);
    if (Coordinates.equals(coordinates, end)) {
      return isBlocked(coordinates, map);
    } else if (Feature.isEnabled(Feature.BLINK_THROUGH_WALLS)) {
      // do nothing
    } else {
      return map.getTile(coordinates).isBlocking();
    }
  }
  throw new Error();
};
