import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { sleep } from '../../../utils/promises';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import { moveUnit } from '../../../actions/moveUnit';
import { attackUnit } from '../../../actions/attackUnit';

const manaCost = 15;
const damageCoefficient = 0.5;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} recoils!`;
};

export const KnockbackAttack: UnitAbility = {
  name: AbilityName.KNOCKBACK_ATTACK,
  manaCost,
  icon: 'icon6',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, imageFactory }: UnitAbilityContext
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
      await attackUnit(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => Math.round(unit.getMeleeDamage() * damageCoefficient),
          getDamageLogMessage,
          sound: Sounds.SPECIAL_ATTACK
        },
        { state, imageFactory }
      );

      targetUnit.setStunned(1);
      if (targetUnit.getLife() > 0) {
        const first = Coordinates.plus(targetUnit.getCoordinates(), direction);
        if (map.contains(first) && !map.isBlocked(first)) {
          await moveUnit(targetUnit, first, { state, imageFactory });
          await sleep(50);
          if (targetUnit.getLife() > 0) {
            const second = Coordinates.plus(first, direction);
            if (map.contains(second) && !map.isBlocked(second)) {
              await moveUnit(targetUnit, second, { state, imageFactory });
            }
          }
        }
      }
    }
  }
};