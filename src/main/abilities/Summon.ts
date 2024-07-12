import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import BasicEnemyController from '@main/units/controllers/BasicEnemyController';
import { Coordinates } from '@lib/geometry/Coordinates';
import { checkNotNull } from '@lib/utils/preconditions';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';

const manaCost = 25;

export const Summon: UnitAbility = {
  name: AbilityName.SUMMON,
  manaCost,
  icon: null,
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  isLegal: (unit, coordinates) => !isBlocked(coordinates, unit.getMap()),
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
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
