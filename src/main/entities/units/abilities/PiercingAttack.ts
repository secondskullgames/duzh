import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, UnitAbilityContext } from './UnitAbility';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { attackUnit } from '../../../actions/attackUnit';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { SpawnerState } from '../../objects/Spawner';
import { AbilityName } from './AbilityName';
import { attackObject } from '../../../actions/attackObject';

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
      await attackUnit(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => unit.getDamage(),
          sound: Sounds.SPECIAL_ATTACK,
          getDamageLogMessage
        },
        { state, renderer, imageFactory }
      );
    }


    const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
    const nextUnit = map.getUnit(nextCoordinates);
    if (nextUnit) {
      await attackUnit(
        {
          attacker: unit,
          defender: nextUnit,
          getDamage: unit => unit.getDamage(),
          sound: Sounds.SPECIAL_ATTACK,
          getDamageLogMessage
        },
        { state, renderer, imageFactory }
      );
    }

    const spawner = map.getSpawner(coordinates);
    if (spawner && spawner.isBlocking()) {
      await attackObject(unit, spawner);
    }

    const nextSpawner = map.getSpawner(nextCoordinates);
    if (nextSpawner && nextSpawner.isBlocking()) {
      await attackObject(unit, nextSpawner);
    }
  }
}