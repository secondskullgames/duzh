import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { GameEngine } from '../../../core/GameEngine';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import UnitService from '../UnitService';

export default class PiercingAttack extends UnitAbility {
  constructor() {
    super({ name: 'PIERCE', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
    const map = state.getMap();
    const unitService = UnitService.getInstance();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
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
      const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
      const nextUnit = map.getUnit(nextCoordinates);
      if (nextUnit) {
        const damage = unit.getDamage();
        playSound(Sounds.PLAYER_HITS_ENEMY);
        await unitService.startAttack(unit, nextUnit);
        await engine.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit: nextUnit,
          ability: this
        });
      }

      const spawner = map.getSpawner(coordinates);
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