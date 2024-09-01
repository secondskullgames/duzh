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

export class FreeMove implements UnitAbility {
  static readonly MANA_COST = 4;
  readonly name = AbilityName.FREE_MOVE;
  manaCost = FreeMove.MANA_COST;
  readonly icon = 'icon5';
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return !isBlocked(coordinates, unit.getMap());
  };

  use = async (
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
      unit.spendMana(this.manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  };
}
