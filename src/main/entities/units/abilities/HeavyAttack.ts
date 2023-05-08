import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, AbilityName, UnitAbilityProps } from './UnitAbility';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import { startAttack } from '../../../actions/startAttack';
import { walk } from '../../../actions/walk';

const _getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
  return `${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`;
}

const _manaCost = 8;

export const HeavyAttack: UnitAbility = {
  name: AbilityName.HEAVY_ATTACK,
  manaCost: _manaCost,
  icon: 'icon1',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('HeavyAttack requires a target!');
    }

    const map = state.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state });
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          playSound(Sounds.SPECIAL_ATTACK);
          unit.spendMana(_manaCost);
          const damage = unit.getDamage() * 2;
          await startAttack(
            unit,
            targetUnit,
            { state, renderer }
          );
          const adjustedDamage = await dealDamage(damage, {
            sourceUnit: unit,
            targetUnit
          });
          const message = _getDamageLogMessage(unit, targetUnit, adjustedDamage);
          logMessage(message, { state });
        }
      }
    }
  },

  getDamageLogMessage: _getDamageLogMessage
}