import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import UnitActionsService from '../UnitActionsService';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { moveUnit } from '../../../actions/moveUnit';

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
    const actionsService = UnitActionsService.getInstance();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { state });
    } else {
      const targetUnit = map.getUnit(coordinates);
      if (targetUnit) {
        await actionsService.attack(unit, targetUnit);
      }
      const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
      const nextUnit = map.getUnit(nextCoordinates);
      if (nextUnit) {
        await actionsService.attack(unit, nextUnit);
      }

      const spawner = map.getSpawner(coordinates);
      const animationFactory = AnimationFactory.getInstance();
      const renderer = GameRenderer.getInstance();
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
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
  };
}