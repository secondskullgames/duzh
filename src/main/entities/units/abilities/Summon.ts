import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Sounds from '../../../sounds/Sounds';
import BasicEnemyController from '../controllers/BasicEnemyController';
import { checkNotNull } from '@main/utils/preconditions';
import { Session, GameState } from '@main/core';
import { Coordinates } from '@main/geometry';

const manaCost = 25;

export const Summon: UnitAbility = {
  name: AbilityName.SUMMON,
  manaCost,
  icon: null,
  innate: false,

  use: async (
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
    unit.spendMana(manaCost);
  }
};
