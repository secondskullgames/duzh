import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility, { UnitAbilityProps } from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import Block from '../../objects/Block';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { walk } from '../../../actions/walk';
import { attack } from '../../../actions/attack';
import { openDoor } from '../../../actions/openDoor';
import { pushBlock } from '../../../actions/pushBlock';

export default class NormalAttack extends UnitAbility {
  constructor() {
    super({ name: 'ATTACK', manaCost: 0 });
  }

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }

    const renderer = GameRenderer.getInstance();
    const animationFactory = AnimationFactory.getInstance();

    const map = state.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state });
        return;
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          await attack(unit, targetUnit, { state, renderer, animationFactory });
          return;
        }
        const door = map.getDoor(coordinates);
        if (door) {
          await openDoor(unit, door);
          return;
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
          return;
        }

        const block = map.getObjects(coordinates)
          .filter(object => object.getObjectType() === 'block')
          .map(object => object as Block)
          .find(block => block.isMovable());

        if (block) {
          await pushBlock(unit, block, { state });
          return;
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}