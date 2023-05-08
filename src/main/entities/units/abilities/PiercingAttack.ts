import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { walk } from '../../../actions/walk';
import { attack } from '../../../actions/attack';

export default class PiercingAttack extends UnitAbility {
  constructor() {
    super({ name: 'PIERCE', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const state = GameState.getInstance();
    const map = state.getMap();
    const animationFactory = AnimationFactory.getInstance();
    const renderer = GameRenderer.getInstance();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state });
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          await attack(unit, targetUnit, { state, renderer, animationFactory });
        }
        const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
        const nextUnit = map.getUnit(nextCoordinates);
        if (nextUnit) {
          await attack(unit, nextUnit, { state, renderer, animationFactory });
        }

        const spawner = map.getSpawner(coordinates);
        if (spawner && spawner.isBlocking()) {
          playSound(Sounds.SPECIAL_ATTACK);
          const animation = animationFactory.getAttackingAnimation(unit);
          await playAnimation(animation, {
            state,
            renderer
          });
          spawner.setState('DEAD');
        }

        const nextSpawner = map.getSpawner(nextCoordinates);
        if (nextSpawner && nextSpawner.isBlocking()) {
          playSound(Sounds.SPECIAL_ATTACK);
          const animation = animationFactory.getAttackingAnimation(unit);
          await playAnimation(animation, {
            state,
            renderer
          });
          nextSpawner.setState('DEAD');
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}