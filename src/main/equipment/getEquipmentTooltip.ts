import { EquipmentModel } from '@models/EquipmentModel';

export const getEquipmentTooltip = (equipment: EquipmentModel): string => {
  const lines = [];
  lines.push(`Slot: ${equipment.slot}`);
  if (equipment.stats.damage) {
    lines.push(`Damage: ${equipment.stats.damage}`);
  }
  if (equipment.stats.absorbAmount) {
    const absorb = floatToPercent(equipment.stats.absorbAmount);
    lines.push(`Absorb: ${absorb}`);
  }
  if (equipment.stats.blockAmount) {
    const block = floatToPercent(equipment.stats.blockAmount);
    lines.push(`Block: ${block}`);
  }
  if (equipment.tooltip) {
    lines.push('');
    lines.push(...equipment.tooltip.split('\n'));
  }
  return lines.join('\n');
};

const floatToPercent = (value: number): string => `${(value * 100).toFixed(0)}%`;
