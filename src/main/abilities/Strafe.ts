import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { moveUnit } from '@main/actions/moveUnit';
import { isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

export class Strafe implements UnitAbility {
  readonly name = AbilityName.STRAFE;
  manaCost = 0;
  readonly icon = null;
  readonly innate = true;

  isEnabled = () => true;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return !isBlocked(coordinates, unit.getMap());
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { session } = game;
    const map = session.getMap();
    if (map.contains(coordinates) && !isBlocked(coordinates, map)) {
      await moveUnit(unit, coordinates, game);
    }
  };
}
