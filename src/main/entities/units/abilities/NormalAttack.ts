import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityProps } from './UnitAbility';
import Block from '../../objects/Block';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { walk } from '../../../actions/walk';
import { attack } from '../../../actions/attack';
import { openDoor } from '../../../actions/openDoor';
import { pushBlock } from '../../../actions/pushBlock';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { ObjectType } from '../../objects/GameObject';
import { SpawnerState } from '../../objects/Spawner';
import { AbilityName } from './AbilityName';

export const NormalAttack: UnitAbility = {
  name: AbilityName.ATTACK,
  icon: null,
  manaCost: 0,
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }

    const map = state.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state, renderer, imageFactory });
        return;
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          await attack(unit, targetUnit, { state, renderer, imageFactory });
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
          const animation = AnimationFactory.getAttackingAnimation(unit, null, { state });
          await playAnimation(animation, {
            state,
            renderer
          });
          spawner.setState(SpawnerState.DEAD);
          return;
        }

        const block = map.getObjects(coordinates)
          .filter(object => object.getObjectType() === ObjectType.BLOCK)
          .map(object => object as Block)
          .find(block => block.isMovable());

        if (block) {
          await pushBlock(unit, block, { state, renderer, imageFactory });
          return;
        }
      }
    }
  },

  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  }
};