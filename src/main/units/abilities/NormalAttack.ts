import Unit from '../Unit';
import Coordinates from '../../geometry/Coordinates';
import { GameEngine } from '../../core/GameEngine';
import GameState from '../../core/GameState';
import { pointAt } from '../../utils/geometry';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import { getAttackingAnimation } from '../../graphics/animations/Animations';
import UnitAbility from './UnitAbility';

export default class NormalAttack extends UnitAbility {
  constructor() {
    super({ name: 'ATTACK', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }

    const { x, y } = coordinates;

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        const damage = unit.getDamage();
        playSound(Sounds.PLAYER_HITS_ENEMY);
        await unit.startAttack(targetUnit);
        await engine.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit,
          ability: this
        });
      }

      const door = map.getDoor({ x, y });
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

      const spawner = map.getSpawner({ x, y });
      if (spawner && spawner.isBlocking()) {
        playSound(Sounds.SPECIAL_ATTACK);
        const animation = await getAttackingAnimation(unit);
        await engine.playAnimation(animation);
        spawner.setState('DEAD');
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}