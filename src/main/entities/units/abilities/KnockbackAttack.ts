import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { sleep } from '../../../utils/promises';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import { moveUnit } from '../../../actions/moveUnit';
import { attack } from '../../../actions/attack';

const manaCost = 8;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} recoils!`;
}

export const KnockbackAttack: UnitAbility = {
  name: AbilityName.KNOCKBACK_ATTACK,
  manaCost,
  icon: 'icon6',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
    }

    const direction = pointAt(unit.getCoordinates(), coordinates);

    const map = state.getMap();
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
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

      const first = Coordinates.plus(targetUnit.getCoordinates(), direction);
      if (map.contains(first) && !map.isBlocked(first)) {
        await moveUnit(targetUnit, first, { state, renderer, imageFactory });
        await renderer.render();
        await sleep(50);
        const second = Coordinates.plus(first, direction);
        if (map.contains(second) && !map.isBlocked(second)) {
          await moveUnit(targetUnit, second, { state, renderer, imageFactory });
        }
      }
    }
  }
};