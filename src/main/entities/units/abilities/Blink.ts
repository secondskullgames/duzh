import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '../../../actions/moveUnit';
import { Feature } from '../../../utils/features';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

const manaCost = 10;

export const Blink: UnitAbility = {
  name: AbilityName.BLINK,
  manaCost,
  icon: 'blink_icon',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Blink requires a target!');
    }

    const map = session.getMap();
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let blocked = false;
    const isBlocked = (coordinates: Coordinates): boolean => {
      return !map.contains(coordinates) || map.getTile(coordinates).isBlocking();
    };

    if (Feature.isEnabled(Feature.BLINK_THROUGH_WALLS)) {
      for (let i = 0; i < distance; i++) {
        x += dx;
        y += dy;
      }
      if (isBlocked({ x, y })) {
        blocked = true;
      }
    } else {
      for (let i = 0; i < distance; i++) {
        x += dx;
        y += dy;
        if (isBlocked({ x, y })) {
          blocked = true;
        }
      }
    }

    if (blocked) {
      playSound(Sounds.BLOCKED);
    } else {
      await moveUnit(unit, { x, y }, { state, map, session });
      unit.spendMana(manaCost);
    }
  }
};
