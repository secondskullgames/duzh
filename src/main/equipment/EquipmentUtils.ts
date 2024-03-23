import { EquipmentModel } from '@models/EquipmentModel';
import { EquipmentSlot } from '@models/EquipmentSlot';

export const getEquipmentTooltip = (equipment: EquipmentModel): string => {
  const lines = [];
  lines.push(`Slot: ${equipment.slot}`);
  if (equipment.stats.damage) {
    lines.push(`Damage: ${equipment.stats.damage}`);
  }
  if (equipment.stats.absorbAmount) {
    const absorb = _floatToPercent(equipment.stats.absorbAmount);
    lines.push(`Absorb: ${absorb}`);
  }
  if (equipment.stats.blockAmount) {
    const block = _floatToPercent(equipment.stats.blockAmount);
    lines.push(`Block: ${block}`);
  }
  if (equipment.tooltip) {
    lines.push('');
    lines.push(...equipment.tooltip.split('\n'));
  }
  return lines.join('\n');
};

export const getSlotName = (slot: EquipmentSlot): string => {
  switch (slot) {
    case EquipmentSlot.CHEST:
      return 'Chest';
    case EquipmentSlot.CLOAK:
      return 'Cloak';
    case EquipmentSlot.HEAD:
      return 'Head';
    case EquipmentSlot.LEGS:
      return 'Legs';
    case EquipmentSlot.MELEE_WEAPON:
      return 'Melee Weapon';
    case EquipmentSlot.RANGED_WEAPON:
      return 'Ranged Weapon';
    case EquipmentSlot.SHIELD:
      return 'Shield';
  }
};

const _floatToPercent = (value: number): string => `${(value * 100).toFixed(0)}%`;
