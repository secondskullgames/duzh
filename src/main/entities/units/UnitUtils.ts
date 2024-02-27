import Unit from './Unit';
import { UnitAbility } from './abilities/UnitAbility';
import { isInStraightLine } from '@main/geometry/CoordinatesUtils';
import { NumberKey } from '@main/input/inputTypes';

export const getMeleeDamage = (unit: Unit): number => {
  let damage = unit.getStrength();

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.slot !== 'RANGED_WEAPON') {
      damage += equipment.damage ?? 0;
    }
  }

  return damage;
};

export const getRangedDamage = (unit: Unit): number => {
  let damage = unit.getDexterity();

  for (const equipment of unit.getEquipment().getAll()) {
    switch (equipment.slot) {
      case 'RANGED_WEAPON':
        damage += equipment.damage ?? 0;
        break;
      case 'MELEE_WEAPON':
        // do nothing
        break;
      default:
        damage += Math.floor((equipment.damage ?? 0) / 2);
    }
  }

  return damage;
};

export const calculateTotalIncomingDamage = (
  unit: Unit,
  baseDamage: number,
  sourceUnit: Unit | null
): number => {
  let absorbRatio = 0;
  for (const equipment of unit.getEquipment().getAll()) {
    absorbRatio += equipment.absorbAmount ?? 0;
    if (equipment.blockAmount !== null) {
      if (
        sourceUnit !== null &&
        isInStraightLine(unit.getCoordinates(), sourceUnit.getCoordinates())
      ) {
        absorbRatio += equipment.blockAmount ?? 0;
      }
    }
  }
  if (absorbRatio > 1) {
    absorbRatio = 1;
  }

  return Math.round(baseDamage * (1 - absorbRatio));
};

export const getHotkeyAbility = (
  playerUnit: Unit,
  hotkey: NumberKey
): UnitAbility | undefined => {
  const index = parseInt(hotkey.toString());
  return playerUnit.getAbilities().filter(ability => !ability.innate)[index - 1];
};
