import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { sleep } from '@lib/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';
import { Direction } from '@lib/geometry/Direction';
import { Game } from '@main/core/Game';

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
    const { soundPlayer } = game;
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
        await game.unitService.moveUnit(unit, { x, y }, game);
        moved = true;
        if (map.isTileRevealed({ x, y })) {
          await sleep(100);
        }
      } else {
        break;
      }
    }

    if (moved) {
      soundPlayer.playSound(Sounds.FOOTSTEP);
      unit.spendMana(this.manaCost);
    } else {
      soundPlayer.playSound(Sounds.BLOCKED);
    }
  };
}
