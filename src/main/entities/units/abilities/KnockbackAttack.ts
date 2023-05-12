import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { sleep } from '../../../utils/promises';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import { startAttack } from '../../../actions/startAttack';
import { AbilityName } from './AbilityName';
import { die } from '../../../actions/die';

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
      playSound(Sounds.SPECIAL_ATTACK);
      const damage = unit.getDamage();
      await startAttack(
        unit,
        targetUnit,
        { state, renderer, imageFactory }
      );
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
      logMessage(message, { state });

      if (targetUnit.getLife() <= 0) {
        await die(targetUnit, { state });
        return;
      }

      targetUnit.setStunned(1);

      const first = Coordinates.plus(targetUnit.getCoordinates(), direction);
      if (map.contains(first) && !map.isBlocked(first)) {
        targetUnit.setCoordinates(first);
        await renderer.render();
        await sleep(50);
        const second = Coordinates.plus(first, direction);
        if (map.contains(second) && !map.isBlocked(second)) {
          targetUnit.setCoordinates(second);
        }
      }
    }
  },
  getDamageLogMessage
};