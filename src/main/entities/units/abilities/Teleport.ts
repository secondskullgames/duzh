import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { manhattanDistance } from '../../../maps/MapUtils';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import { GameEngine } from '../../../core/GameEngine';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';

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
    const engine = GameEngine.getInstance();
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

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      playSound(Sounds.WIZARD_VANISH);

      {
        const animation = await animationFactory.getWizardVanishingAnimation(unit);
        await engine.playAnimation(animation);
      }

      await unit.moveTo({ x, y });
      playSound(Sounds.WIZARD_APPEAR);

      {
        const animation = await animationFactory.getWizardAppearingAnimation(unit);
        await engine.playAnimation(animation);
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