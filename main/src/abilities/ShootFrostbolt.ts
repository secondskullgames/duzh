import { Coordinates, pointAt } from '@duzh/geometry';
import { shootFrostbolt } from '@main/actions/shootFrostbolt';
import { Game } from '@main/core/Game';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class ShootFrostbolt implements UnitAbility {
  static readonly DAMAGE = 10;
  static readonly FREEZE_DURATION = 5;
  readonly name = AbilityName.SHOOT_FROSTBOLT;
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
    await shootFrostbolt(
      unit,
      direction,
      ShootFrostbolt.DAMAGE,
      ShootFrostbolt.FREEZE_DURATION,
      game
    );
  };
}
