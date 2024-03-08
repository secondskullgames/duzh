import EquipmentModel from '../../schemas/EquipmentModel';

export const getEquipmentTooltip = (equipment: EquipmentModel): string => {
  const lines = [];
  lines.push(`Slot: ${equipment.slot}`);
  if (equipment.stats.damage) {
    lines.push(`Damage: ${equipment.stats.damage}`);
  }
  if (equipment.stats.absorbAmount) {
    lines.push(`Absorb: ${equipment.stats.absorbAmount}`);
  }
  if (equipment.stats.blockAmount) {
    lines.push(`Block: ${equipment.stats.blockAmount}`);
  }
  if (equipment.tooltip) {
    lines.push('');
    lines.push(equipment.tooltip.split('\n'));
  }
  return lines.join('\n');
};
