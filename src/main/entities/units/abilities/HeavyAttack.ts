import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import type { UnitAbility, UnitAbilityProps } from './UnitAbility';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import { startAttack } from '../../../actions/startAttack';
import { walk } from '../../../actions/walk';
import { AbilityName } from './AbilityName';
import { die } from '../../../actions/die';
import { awardExperience } from '../../../actions/awardExperience';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
  return `${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`;
}

const manaCost = 8;

export const HeavyAttack: UnitAbility = {
  name: AbilityName.HEAVY_ATTACK,
  manaCost,
  icon: 'icon1',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityProps
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
        await walk(unit, direction, { state, renderer, imageFactory });
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          playSound(Sounds.SPECIAL_ATTACK);
          unit.spendMana(manaCost);
          const damage = unit.getDamage() * 2;
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
          }
        }
      }
    }
  },

  getDamageLogMessage
}