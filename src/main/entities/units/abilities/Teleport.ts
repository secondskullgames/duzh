import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { manhattanDistance } from '../../../maps/MapUtils';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { moveUnit } from '../../../actions/moveUnit';

export default class Teleport extends UnitAbility {
  readonly RANGE = 5;

  constructor() {
    super({ name: 'TELEPORT', manaCost: 24 });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    const state = GameState.getInstance();
    const animationFactory = AnimationFactory.getInstance();

    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (manhattanDistance(unit.getCoordinates(), coordinates) > this.RANGE) {
      throw new Error(`Can't teleport more than ${this.RANGE} units`);
    }

    const { x, y } = coordinates;

    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      playSound(Sounds.WIZARD_VANISH);

      const renderer = GameRenderer.getInstance();
      {
        const animation = await animationFactory.getWizardVanishingAnimation(unit);
        await playAnimation(animation, {
          state,
          renderer
        });
      }

      await moveUnit(unit, coordinates, { state });
      playSound(Sounds.WIZARD_APPEAR);

      {
        const animation = await animationFactory.getWizardAppearingAnimation(unit);
        await playAnimation(animation, {
          state,
          renderer
        });
      }

      unit.spendMana(this.manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
    throw new Error('can\'t get here');
  };
}