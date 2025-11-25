import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates, pointAt } from '@duzh/geometry';
import { shootFireball } from '@main/actions/shootFireball';
import { Game } from '@main/core/Game';

export class ShootFireball implements UnitAbility {
  static readonly MANA_COST = 25;
  static readonly DAMAGE = 20;
  readonly name = AbilityName.SHOOT_FIREBALL;
  readonly icon = 'icon6';
  manaCost = ShootFireball.MANA_COST;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = () => true; // TODO

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.spendMana(this.manaCost);
    await shootFireball(unit, direction, ShootFireball.DAMAGE, game);
  };
}
