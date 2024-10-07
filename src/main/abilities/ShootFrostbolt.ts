import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { shootFrostbolt } from '@main/actions/shootFrostbolt';
import { Game } from '@main/core/Game';

export class ShootFrostbolt implements UnitAbility {
  static readonly DAMAGE = 10;
  static readonly FREEZE_DURATION = 5;
  readonly name = AbilityName.SHOOT_FROSTBOLT;
  readonly icon = 'harpoon_icon';
  manaCost = 10;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = () => true; // TODO

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFrostbolt(
      unit,
      direction,
      ShootFrostbolt.DAMAGE,
      ShootFrostbolt.FREEZE_DURATION,
      game
    );
  };
}
