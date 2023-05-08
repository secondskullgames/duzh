import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { checkNotNull } from '../../../utils/preconditions';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitFactory from '../UnitFactory';
import UnitAbility, { type UnitAbilityProps } from './UnitAbility';
import HumanRedesignController from '../controllers/HumanRedesignController';

export default class Summon extends UnitAbility {
  constructor() {
    super({ name: 'SUMMON', manaCost: 25 });
  }

  /**
   * @override
   */
  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('Summon requires a target!');
    }

    const map = state.getMap();

    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    // TODO pick a sound
    playSound(Sounds.WIZARD_APPEAR);
    // TODO animation
    const summonedUnit = await UnitFactory.getInstance().createUnit({
      unitClass,
      faction: unit.getFaction(),
      controller: new HumanRedesignController({ state }), // TODO
      level: 1, // whatever
      coordinates
    });
    map.addUnit(summonedUnit);
    unit.spendMana(this.manaCost);
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
    throw new Error('can\'t get here');
  };
}