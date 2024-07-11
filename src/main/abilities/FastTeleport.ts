import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { Activity } from '@main/units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { isBlocked } from '@main/maps/MapUtils';

const manaCost = 4;

export const FastTeleport: UnitAbility = {
  name: AbilityName.FAST_TELEPORT,
  icon: null,
  manaCost,
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('FastTeleport requires a target!');
    }

    const map = unit.getMap();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      unit.spendMana(manaCost);
      await moveUnit(unit, coordinates, session, state);
      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
