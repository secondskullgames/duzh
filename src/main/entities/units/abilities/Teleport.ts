import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { manhattanDistance } from '../../../maps/MapUtils';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, AbilityName, type UnitAbilityProps } from './UnitAbility';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { moveUnit } from '../../../actions/moveUnit';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';

export const range = 5;
const manaCost = 25;

export const Teleport: UnitAbility = {
  name: AbilityName.TELEPORT,
  icon: null,
  manaCost,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (manhattanDistance(unit.getCoordinates(), coordinates) > range) {
      throw new Error(`Can't teleport more than ${range} units`);
    }

    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      playSound(Sounds.WIZARD_VANISH);

      {
        const animation = await AnimationFactory.getWizardVanishingAnimation(unit, { state });
        await playAnimation(animation, {
          state,
          renderer
        });
      }

      await moveUnit(unit, coordinates, { state });
      playSound(Sounds.WIZARD_APPEAR);

      {
        const animation = await AnimationFactory.getWizardAppearingAnimation(unit, { state });
        await playAnimation(animation, {
          state,
          renderer
        });
      }

      unit.spendMana(manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  },

  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number) => {
    throw new Error('can\'t get here');
  }
}