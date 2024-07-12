import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { checkState } from '@lib/utils/preconditions';
import { Direction } from '@lib/geometry/Direction';

const manaCost = 10;
const distance = 2;

export const Blink: UnitAbility = {
  name: AbilityName.BLINK,
  manaCost,
  icon: 'blink_icon',
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  isLegal: (unit: Unit, coordinates: Coordinates) => {
    const map = unit.getMap();
    return !_isBlocked(unit.getCoordinates(), coordinates, map);
  },
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = unit.getMap();
    const direction = Direction.between(unit.getCoordinates(), coordinates);

    unit.setDirection(direction);

    const { dx, dy } = Direction.getOffsets(direction);
    const targetCoordinates = Coordinates.plus(unit.getCoordinates(), {
      dx: distance * dx,
      dy: distance * dy
    });
    const blocked = _isBlocked(unit.getCoordinates(), targetCoordinates, map);
    checkState(!blocked);

    await moveUnit(unit, targetCoordinates, session, state);
    unit.spendMana(manaCost);
  }
};

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
