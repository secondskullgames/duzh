import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import { attack } from '../../../actions/attack';

const manaCost = 15;
const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} is stunned!`;
};

/**
 * A one-turn variant of {@link StunAttack}
 */
export const MinorStunAttack: UnitAbility = {
  name: AbilityName.MINOR_STUN_ATTACK,
  manaCost,
  icon: 'icon2',

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('MinorStunAttack requires a target!');
    }

    const { x, y } = coordinates;

    const map = state.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      unit.spendMana(manaCost);
      await attack(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => unit.getDamage(),
          getDamageLogMessage,
          sound: Sounds.SPECIAL_ATTACK
        },
        { state, renderer, imageFactory }
      );
      targetUnit.setStunned(1);
    }
  }
}