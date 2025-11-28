import { Coordinates, pointAt } from '@duzh/geometry';
import { shootFirebolt } from '@main/actions/shootFirebolt';
import { Game } from '@main/core/Game';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class ShootFirebolt implements UnitAbility {
  static readonly DAMAGE = 10;
  static readonly BURN_DURATION = 5;
  readonly name = AbilityName.SHOOT_FIREBOLT;
  readonly icon = 'harpoon_icon';
  manaCost = 10;
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  isLegal = () => true; // TODO

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
      unit.spendMana(this.manaCost);
    }
    await shootFirebolt(
      unit,
      direction,
      ShootFirebolt.DAMAGE,
      ShootFirebolt.BURN_DURATION,
      game
    );
  };
}
