import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { Activity } from '@main/units/Activity';
import { Coordinates, hypotenuse, pointAt } from '@duzh/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { sleep } from '@lib/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

export class Teleport implements UnitAbility {
  static readonly RANGE = 3;
  static readonly MANA_COST = 20;
  readonly name = AbilityName.TELEPORT;
  manaCost = Teleport.MANA_COST;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return (
      !isBlocked(coordinates, unit.getMap()) &&
      hypotenuse(unit.getCoordinates(), coordinates) <= Teleport.RANGE
    );
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundPlayer } = game;
    const map = unit.getMap();

    const maybeSleep = async () => {
      if (map.isTileRevealed(coordinates)) {
        await sleep(100);
      }
    };

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !isBlocked(coordinates, map)) {
      unit.spendMana(this.manaCost);
      soundPlayer.playSound(Sounds.WIZARD_VANISH);

      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.VANISHING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
      await maybeSleep();

      await moveUnit(unit, coordinates, game);
      await maybeSleep();

      soundPlayer.playSound(Sounds.WIZARD_APPEAR);
      for (let i = 1; i <= 4; i++) {
        unit.setActivity(Activity.APPEARING, i, unit.getDirection());
        await maybeSleep();
      }

      unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    } else {
      soundPlayer.playSound(Sounds.BLOCKED);
    }
  };
}
