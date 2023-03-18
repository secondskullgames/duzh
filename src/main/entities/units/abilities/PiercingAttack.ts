import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { GameEngine } from '../../../core/GameEngine';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';

export default class PiercingAttack extends UnitAbility {
  constructor() {
    super({ name: 'PIERCE', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const { x, y } = coordinates;

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
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
      const nextCoordinates = Coordinates.plus({ x, y }, unit.getDirection());
      const nextUnit = map.getUnit(nextCoordinates);
      if (nextUnit) {
        const damage = unit.getDamage();
        playSound(Sounds.PLAYER_HITS_ENEMY);
        await unit.startAttack(nextUnit);
        await engine.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit: nextUnit,
          ability: this
        });
      }

      const spawner = map.getSpawner({ x, y });
      if (spawner && spawner.isBlocking()) {
        playSound(Sounds.SPECIAL_ATTACK);
        const animation = AnimationFactory.getInstance().getAttackingAnimation(unit);
        await engine.playAnimation(animation);
        spawner.setState('DEAD');
      }

      const nextSpawner = map.getSpawner(nextCoordinates);
      if (nextSpawner && nextSpawner.isBlocking()) {
        playSound(Sounds.SPECIAL_ATTACK);
        const animation = AnimationFactory.getInstance().getAttackingAnimation(unit);
        await engine.playAnimation(animation);
        nextSpawner.setState('DEAD');
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}