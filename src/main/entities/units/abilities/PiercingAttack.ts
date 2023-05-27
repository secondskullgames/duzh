import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, UnitAbilityContext } from './UnitAbility';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { attack } from '../../../actions/attack';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { SpawnerState } from '../../objects/Spawner';
import { AbilityName } from './AbilityName';
import { die } from '../../../actions/die';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
};

export const PiercingAttack: UnitAbility = {
  name: AbilityName.PIERCE,
  manaCost: 0,
  icon: null,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const map = state.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await attack(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => unit.getDamage(),
          sound: Sounds.SPECIAL_ATTACK,
          getDamageLogMessage
        },
        { state, renderer, imageFactory }
      );
      if (targetUnit.getLife() <= 0) {
        await die(targetUnit, { state });
      }
    }


    const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
    const nextUnit = map.getUnit(nextCoordinates);
    if (nextUnit) {
      await attack(
        {
          attacker: unit,
          defender: nextUnit,
          getDamage: unit => unit.getDamage(),
          sound: Sounds.SPECIAL_ATTACK,
          getDamageLogMessage
        },
        { state, renderer, imageFactory }
      );
      if (nextUnit.getLife() <= 0) {
        await die(nextUnit, { state });
      }
    }

    const spawner = map.getSpawner(coordinates);
    if (spawner && spawner.isBlocking()) {
      playSound(Sounds.SPECIAL_ATTACK);
      const animation = AnimationFactory.getAttackingAnimation(
        unit,
        null,
        { state, imageFactory }
      );
      await playAnimation(
        animation,
        { state, renderer }
      );
      spawner.setState(SpawnerState.DEAD);
    }

    const nextSpawner = map.getSpawner(nextCoordinates);
    if (nextSpawner && nextSpawner.isBlocking()) {
      playSound(Sounds.SPECIAL_ATTACK);
      const animation = AnimationFactory.getAttackingAnimation(
        unit,
        null,
        { state, imageFactory }
      );
      await playAnimation(
        animation,
        { state, renderer }
      );
      nextSpawner.setState(SpawnerState.DEAD);
    }
  }
}