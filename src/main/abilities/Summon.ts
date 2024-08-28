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

export class Summon implements UnitAbility {
  static readonly MANA_COST = 25;
  readonly name = AbilityName.SUMMON;
  manaCost = Summon.MANA_COST;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) =>
    !isBlocked(coordinates, unit.getMap());

  use = async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    state.getSoundPlayer().playSound(Sounds.WIZARD_APPEAR);

    const summonedUnit = await state.getUnitFactory().createUnit({
      unitClass,
      faction: unit.getFaction(),
      controller: new BasicEnemyController(),
      level: 1,
      coordinates,
      map
    });
    map.addUnit(summonedUnit);
    unit.spendMana(this.manaCost);
  };
}
