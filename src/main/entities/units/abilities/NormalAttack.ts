import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { attackUnit } from '../../../actions/attackUnit';
import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';

export const NormalAttack: UnitAbility = {
  name: AbilityName.ATTACK,
  icon: null,
  manaCost: 0,
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }
    // TODO: verify coordinates are adjacent

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
          getDamageLogMessage,
          sound: Sounds.PLAYER_HITS_ENEMY
        },
        { state, renderer, imageFactory }
      );
    }
  }
};

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
}