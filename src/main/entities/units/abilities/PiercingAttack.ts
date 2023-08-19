import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, UnitAbilityContext } from './UnitAbility';
import { attackUnit } from '../../../actions/attackUnit';
import { AbilityName } from './AbilityName';
import { attackObject } from '../../../actions/attackObject';
import { getSpawner } from '../../../maps/MapUtils';

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
    { state, map, ticker }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await attackUnit(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => unit.getMeleeDamage(),
          sound: Sounds.SPECIAL_ATTACK,
          getDamageLogMessage
        },
        { state, map, ticker }
      );
    }


    const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
    const nextUnit = map.getUnit(nextCoordinates);
    if (nextUnit) {
      await attackUnit(
        {
          attacker: unit,
          defender: nextUnit,
          getDamage: unit => unit.getMeleeDamage(),
          sound: Sounds.SPECIAL_ATTACK,
          getDamageLogMessage
        },
        { state, map, ticker }
      );
    }

    const spawner = getSpawner(map, coordinates);
    if (spawner && spawner.isBlocking()) {
      await attackObject(unit, spawner);
    }

    const nextSpawner = getSpawner(map, nextCoordinates);
    if (nextSpawner && nextSpawner.isBlocking()) {
      await attackObject(unit, nextSpawner);
    }
  }
}