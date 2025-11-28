import { Coordinates, hypotenuse, pointAt } from '@duzh/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { Game } from '@main/core/Game';
import { isBlocked } from '@main/maps/MapUtils';
import { Activity } from '@main/units/Activity';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { sleep } from '@main/utils/promises';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class Teleport implements UnitAbility {
  static readonly RANGE = 3;
  static readonly MANA_COST = 20;
  readonly name = AbilityName.TELEPORT;
  manaCost = Teleport.MANA_COST;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return (
      !isBlocked(coordinates, unit.getMap()) &&
      hypotenuse(unit.getCoordinates(), coordinates) <= Teleport.RANGE
    );
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundController } = game;
    const map = unit.getMap();

    const maybeSleep = async () => {
      if (map.isTileRevealed(coordinates)) {
        await sleep(100);
      }
    };

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(coordinates, map)) {
      if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
        unit.spendMana(this.manaCost);
      }
      soundController.playSound('wizard_vanish');

      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.VANISHING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      await maybeSleep();

      await moveUnit(unit, coordinates, game);
      await maybeSleep();

      soundController.playSound('wizard_appear');
      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.APPEARING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    } else {
      soundController.playSound('blocked');
    }
  };
}
