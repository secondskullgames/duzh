import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { sleep } from '@lib/utils/promises';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { Direction } from '@lib/geometry/Direction';

export class Dash implements UnitAbility {
  readonly name = AbilityName.DASH;
  readonly manaCost = 4;
  readonly icon = 'icon5';
  readonly innate = true;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    const { dx, dy } = Direction.getOffsets(direction);
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
        await moveUnit(unit, { x, y }, session, state);
        moved = true;
        if (map.isTileRevealed({ x, y })) {
          await sleep(100);
        }
      } else {
        break;
      }
    }

    if (moved) {
      unit.spendMana(this.manaCost);
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  };
}
