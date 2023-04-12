import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { GameEngine } from '../../../core/GameEngine';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import Block from '../../objects/Block';
import UnitService from '../UnitService';
import UnitActionsService from '../UnitActionsService';

export default class NormalAttack extends UnitAbility {
  constructor() {
    super({ name: 'ATTACK', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
    const map = state.getMap();
    const actionsService = UnitActionsService.getInstance();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
    } else {
      if (!map.isBlocked(coordinates)) {
        await actionsService.walk(unit, direction);
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          await actionsService.attack(unit, targetUnit);
        }

        const door = map.getDoor(coordinates);
        if (door) {
          await actionsService.openDoor(unit, door);
        }

        const spawner = map.getSpawner(coordinates);
        if (spawner && spawner.isBlocking()) {
          playSound(Sounds.SPECIAL_ATTACK);
          const animation = AnimationFactory.getInstance().getAttackingAnimation(unit);
          await engine.playAnimation(animation);
          spawner.setState('DEAD');
        }

        const block = map.getObjects(coordinates)
          .filter(object => object.getObjectType() === 'block')
          .map(object => object as Block)
          .find(block => block.isMovable());

        if (block) {
          await actionsService.pushBlock(unit, block);
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}