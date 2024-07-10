import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import BasicEnemyController from '@main/units/controllers/BasicEnemyController';
import { Coordinates } from '@lib/geometry/Coordinates';
import { checkNotNull } from '@lib/utils/preconditions';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

export class Summon implements UnitAbility {
  readonly name = AbilityName.SUMMON;
  readonly manaCost = 25;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Summon requires a target!');
    }

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
