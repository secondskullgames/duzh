import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '../../../actions/moveUnit';
import { Feature } from '../../../utils/features';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { isBlocked } from '../../../maps/MapUtils';
import MapInstance from '../../../maps/MapInstance';

const manaCost = 10;

export const Blink: UnitAbility = {
  name: AbilityName.BLINK,
  manaCost,
  icon: 'blink_icon',
  innate: false,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Blink requires a target!');
    }

    const map = unit.getMap();
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    const { x, y } = unit.getCoordinates();

    const targetCoordinates = {
      x: x + dx * distance,
      y: y + dy * distance
    };
    const blocked = _isBlocked(unit.getCoordinates(), targetCoordinates, map);

    if (blocked) {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    } else {
      await moveUnit(unit, targetCoordinates, session, state);
      unit.spendMana(manaCost);
    }
  }
};

const _isBlocked = (start: Coordinates, end: Coordinates, map: MapInstance): boolean => {
  const { dx, dy } = pointAt(start, end);
  let { x, y } = start;
  while (!Coordinates.equals({ x, y }, end)) {
    x += dx;
    y += dy;
    if (Coordinates.equals({ x, y }, end)) {
      return isBlocked(map, { x, y });
    } else if (Feature.isEnabled(Feature.BLINK_THROUGH_WALLS)) {
      // do nothing
    } else {
      return map.getTile({ x, y }).isBlocking();
    }
  }
  throw new Error();
};
