import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityProps } from './UnitAbility';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import { startAttack } from '../../../actions/startAttack';
import { walk } from '../../../actions/walk';
import { AbilityName } from './AbilityName';

const manaCost = 10;
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
    { state, renderer, imageFactory }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('StunAttack requires a target!');
    }

    const { x, y } = coordinates;

    const map = state.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state, renderer, imageFactory });
      } else {
        const targetUnit = map.getUnit({ x, y });
        if (targetUnit) {
          playSound(Sounds.SPECIAL_ATTACK);
          unit.spendMana(manaCost);
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
          targetUnit.setStunned(2);
        }
      }
    }
  },

  getDamageLogMessage
}