import { Coordinates, Direction } from '@duzh/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { Game } from '@main/core/Game';
import { isBlocked } from '@main/maps/MapUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class FreeMove implements UnitAbility {
  static readonly MANA_COST = 4;
  readonly name = AbilityName.FREE_MOVE;
  manaCost = FreeMove.MANA_COST;
  readonly icon = 'icon5';
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return !isBlocked(coordinates, unit.getMap());
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundController } = game;
    const map = unit.getMap();
    const direction = Direction.between(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetCoordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    if (!isBlocked(targetCoordinates, map)) {
      await moveUnit(unit, targetCoordinates, game);
      if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
        unit.spendMana(this.manaCost);
      }
    } else {
      soundController.playSound('blocked');
    }
  };
}
