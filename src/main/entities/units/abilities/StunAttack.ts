import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import { attackUnit } from '../../../actions/attackUnit';

const manaCost = 10;
const damageCoefficient = 0.75;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} is stunned!`;
};

export const StunAttack: UnitAbility = {
  name: AbilityName.STUN_ATTACK,
  manaCost,
  icon: 'icon2',

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, imageFactory, ticker }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('StunAttack requires a target!');
    }

    const map = state.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(manaCost);
      await attackUnit(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => Math.round(unit.getMeleeDamage() * damageCoefficient),
          getDamageLogMessage,
          sound: Sounds.SPECIAL_ATTACK
        },
        { state, imageFactory, ticker }
      );
      targetUnit.setStunned(2);
    }
  }
}