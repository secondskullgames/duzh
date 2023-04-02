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
    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (!map.contains(coordinates)) {
      // do nothing
    } else {
      const unitService = UnitService.getInstance();
      if (!map.isBlocked(coordinates)) {
        await unitService.moveUnit(unit, coordinates);
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          const damage = unit.getDamage();
          playSound(Sounds.PLAYER_HITS_ENEMY);
          await unitService.startAttack(unit, targetUnit);
          await engine.dealDamage(damage, {
            sourceUnit: unit,
            targetUnit,
            ability: this
          });
        }

        const door = map.getDoor(coordinates);
        if (door) {
          const keys = playerUnit.getInventory().get('KEY');
          if (keys.length > 0) {
            playerUnit.getInventory().remove(keys[0]);
            playSound(Sounds.OPEN_DOOR);
            await door.open();
          } else {
            playSound(Sounds.BLOCKED);
          }
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
          const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
          const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });
          if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
            await block.moveTo(nextCoordinates);
            await unitService.moveUnit(unit, coordinates);
          }
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}