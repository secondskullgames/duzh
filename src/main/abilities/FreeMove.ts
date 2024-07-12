import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { Direction } from '@lib/geometry/Direction';

const manaCost = 4;

export const FreeMove: UnitAbility = {
  name: AbilityName.FREE_MOVE,
  manaCost,
  icon: 'icon5',
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  isLegal: (unit, coordinates) => {
    return !isBlocked(coordinates, unit.getMap());
  },
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    const direction = Direction.between(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetCoordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    if (!isBlocked(targetCoordinates, map)) {
      await moveUnit(unit, targetCoordinates, session, state);
      unit.spendMana(manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  }
};
