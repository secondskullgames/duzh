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
    const playerUnit = state.getPlayerUnit();

    console.log(`in NormalAttack.use(${coordinates.x},${coordinates.y}) ${playerUnit.getCoordinates().x} ${playerUnit.getCoordinates().y}`);
    const map = state.getMap();
    const actionsService = UnitActionsService.getInstance();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      console.log('!contains');
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        console.log('walking');
        await actionsService.walk(unit, direction);
        return;
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          console.log('attacking');
          await actionsService.attack(unit, targetUnit);
          return;
        } else {
          console.log('!targetUnit');
        }
        const door = map.getDoor(coordinates);
        if (door) {
          await actionsService.openDoor(unit, door);
          return;
        }

        const spawner = map.getSpawner(coordinates);
        if (spawner && spawner.isBlocking()) {
          playSound(Sounds.SPECIAL_ATTACK);
          const animation = AnimationFactory.getInstance().getAttackingAnimation(unit);
          await engine.playAnimation(animation);
          spawner.setState('DEAD');
          return;
        }

        const block = map.getObjects(coordinates)
          .filter(object => object.getObjectType() === 'block')
          .map(object => object as Block)
          .find(block => block.isMovable());

        if (block) {
          await actionsService.pushBlock(unit, block);
          return;
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}