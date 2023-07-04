import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { checkNotNull } from '../../../utils/preconditions';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import UnitFactory from '../UnitFactory';
import { type UnitAbility } from './UnitAbility';
import BasicEnemyController from '../controllers/BasicEnemyController';
import { AbilityName } from './AbilityName';
import { GlobalContext } from '../../../core/GlobalContext';

const manaCost = 25;

export const Summon: UnitAbility = {
  name: AbilityName.SUMMON,
  manaCost,
  icon: null,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    context: GlobalContext
  ) => {
    if (!coordinates) {
      throw new Error('Summon requires a target!');
    }

    const map = context.state.getMap();

    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    // TODO pick a sound
    playSound(Sounds.WIZARD_APPEAR);
    // TODO animation
    const summonedUnit = await UnitFactory.createUnit(
      {
        unitClass,
        faction: unit.getFaction(),
        controller: new BasicEnemyController(),
        level: 1, // whatever
        coordinates
      },
      context
    );
    map.addUnit(summonedUnit);
    unit.spendMana(manaCost);
  }
};