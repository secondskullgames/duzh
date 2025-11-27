import { Coordinates, Direction, pointAt } from '@duzh/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { Game } from '@main/core/Game';
import { isBlocked } from '@main/maps/MapUtils';
import { sleep } from '@main/utils/promises';
import Unit from '../units/Unit';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class Dash implements UnitAbility {
  static readonly MANA_COST = 4;
  readonly name = AbilityName.DASH;
  manaCost = Dash.MANA_COST;
  readonly icon = 'icon5';
  readonly innate = true;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    const onePlus = Coordinates.plusDirection(unit.getCoordinates(), direction);
    return !isBlocked(onePlus, map) && !isBlocked(coordinates, map);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundController } = game;
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    const { dx, dy } = Direction.getOffsets(direction);
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !isBlocked({ x, y }, map)) {
        await moveUnit(unit, { x, y }, game);
        moved = true;
        if (map.isTileRevealed({ x, y })) {
          await sleep(100);
        }
      } else {
        break;
      }
    }

    if (moved) {
      soundController.playSound('footstep');
      unit.spendMana(this.manaCost);
    } else {
      soundController.playSound('blocked');
    }
  };
}
