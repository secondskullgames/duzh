import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import { moveUnit } from '@main/actions/moveUnit';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates } from '@main/geometry';
import { GameState, Session } from '@main/core';

export const Strafe: UnitAbility = {
  name: AbilityName.STRAFE,
  manaCost: 0,
  icon: null,
  innate: true,

  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      await moveUnit(unit, coordinates, session, state);
    }
  }
};
