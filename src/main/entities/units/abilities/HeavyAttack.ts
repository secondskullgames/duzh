import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import type { UnitAbility, UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import { attackUnit } from '../../../actions/attackUnit';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
  return `${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`;
}

const manaCost = 10;

export const HeavyAttack: UnitAbility = {
  name: AbilityName.HEAVY_ATTACK,
  manaCost,
  icon: 'icon1',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, spriteFactory, animationFactory, ticker }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('HeavyAttack requires a target!');
    }

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(manaCost);
      await attackUnit(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => unit.getMeleeDamage() * 2,
          getDamageLogMessage,
          sound: Sounds.SPECIAL_ATTACK
        },
        { state, map, spriteFactory, animationFactory, ticker }
      );
    }
  }
};