import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import BasicEnemyController from '@main/units/controllers/BasicEnemyController';
import { Coordinates } from '@lib/geometry/Coordinates';
import { checkNotNull } from '@lib/utils/preconditions';
import { Engine } from '@main/core/Engine';

export class Summon implements UnitAbility {
  readonly name = AbilityName.SUMMON;
  readonly manaCost = 25;
  readonly icon = null;
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Summon requires a target!');
    }

    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = session.getMap();
    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    // TODO pick a sound
    state.getSoundPlayer().playSound(Sounds.WIZARD_APPEAR);
    // TODO animation
    const summonedUnit = await state.getUnitFactory().createUnit({
      unitClass,
      faction: unit.getFaction(),
      controller: new BasicEnemyController(),
      level: 1, // whatever
      coordinates,
      map
    });
    map.addUnit(summonedUnit);
    unit.spendMana(this.manaCost);
  };
}
