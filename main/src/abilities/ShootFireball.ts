import { Coordinates, pointAt } from '@duzh/geometry';
import { shootFireball } from '@main/actions/shootFireball';
import { Game } from '@main/core/Game';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class ShootFireball implements UnitAbility {
  static readonly MANA_COST = 25;
  static readonly DAMAGE = 20;
  readonly name = AbilityName.SHOOT_FIREBALL;
  readonly icon = 'icon6';
  manaCost = ShootFireball.MANA_COST;
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
    await shootFireball(unit, direction, ShootFireball.DAMAGE, game);
  };
}
