import Unit from './Unit';
import { EquipmentSlot } from '@models/EquipmentSlot';
import { Coordinates } from '@lib/geometry/Coordinates';

export const getMeleeDamage = (unit: Unit): number => {
  let damage = unit.getStrength();

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.slot !== EquipmentSlot.RANGED_WEAPON) {
      damage += equipment.damage ?? 0;
    }
  }

  return damage;
};

export const getRangedDamage = (unit: Unit): number => {
  let damage = unit.getDexterity();

  for (const equipment of unit.getEquipment().getAll()) {
    switch (equipment.slot) {
      case EquipmentSlot.RANGED_WEAPON:
        damage += equipment.damage ?? 0;
        break;
      case EquipmentSlot.MELEE_WEAPON:
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
      if (sourceUnit !== null && isFrontalAttack(unit, sourceUnit)) {
        absorbRatio += equipment.blockAmount ?? 0;
      }
    }
  }
  if (absorbRatio > 1) {
    absorbRatio = 1;
  }

  return Math.round(baseDamage * (1 - absorbRatio));
};

export const isHostile = (first: Unit, second: Unit): boolean =>
  first.getFaction() !== second.getFaction();

const isFrontalAttack = (defender: Unit, attacker: Unit) => {
  const aheadCoordinates = Coordinates.plusDirection(
    defender.getCoordinates(),
    defender.getDirection()
  );
  return Coordinates.equals(aheadCoordinates, attacker.getCoordinates());
};
