import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { checkNotNull } from '../../../utils/preconditions';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitFactory from '../UnitFactory';
import { type UnitAbility, type UnitAbilityProps } from './UnitAbility';
import HumanRedesignController from '../controllers/HumanRedesignController';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import ImageFactory from '../../../graphics/images/ImageFactory';
import { AbilityName } from './AbilityName';

const manaCost = 25;

export const Summon: UnitAbility = {
  name: AbilityName.SUMMON,
  manaCost,
  icon: null,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('Summon requires a target!');
    }

    const map = state.getMap();

    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    // TODO pick a sound
    playSound(Sounds.WIZARD_APPEAR);
    // TODO animation
    const summonedUnit = await UnitFactory.createUnit(
      {
        unitClass,
        faction: unit.getFaction(),
        controller: new HumanRedesignController(),
        level: 1, // whatever
        coordinates
      },
      {
        state,
        renderer,
        imageFactory
      }
    );
    map.addUnit(summonedUnit);
    unit.spendMana(manaCost);
  },

  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number) => {
    throw new Error('can\'t get here');
  }
};