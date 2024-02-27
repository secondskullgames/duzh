import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Sounds from '../../../sounds/Sounds';
import { pointAt } from '@main/utils/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';

const manaCost = 4;

export const FreeMove: UnitAbility = {
  name: AbilityName.FREE_MOVE,
  manaCost,
  icon: 'icon5',
  innate: false,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    const targetCoordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    if (!isBlocked(map, targetCoordinates)) {
      await moveUnit(unit, targetCoordinates, session, state);
      unit.spendMana(manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
