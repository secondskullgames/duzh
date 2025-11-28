import { Coordinates, pointAt } from '@duzh/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { Game } from '@main/core/Game';
import { isBlocked } from '@main/maps/MapUtils';
import { Activity } from '@main/units/Activity';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class FastTeleport implements UnitAbility {
  static readonly MANA_COST = 4;
  readonly name = AbilityName.FAST_TELEPORT;
  readonly icon = null;
  manaCost = FastTeleport.MANA_COST;
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  /**
   * Note: We don't check range here, it's currently only controlled
   * by the Behavior
   */
  isLegal = (unit: Unit, coordinates: Coordinates) => {
    const map = unit.getMap();
    return map.contains(coordinates) && !isBlocked(coordinates, map);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundController } = game;
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
      unit.spendMana(this.manaCost);
    }
    await moveUnit(unit, coordinates, game);
    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    soundController.playSound('footstep');
  };
}
