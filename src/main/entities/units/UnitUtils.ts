import Unit from './Unit';

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
        damage += (equipment.damage ?? 0) / 2;
    }
  }

  return Math.round(damage);
};
