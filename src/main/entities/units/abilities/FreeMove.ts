import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '@main/actions/moveUnit';
import { Session, GameState } from '@main/core';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates, pointAt } from '@main/geometry';

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
