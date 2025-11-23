import { EquipmentModel, EquipmentSlot } from '@duzh/models';

export const getEquipmentTooltip = (equipment: EquipmentModel): string => {
  const lines = [];
  lines.push(getSlotName(equipment.slot));
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
    lines.push(...splitTooltipToLines(equipment.tooltip, 27));
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

export const splitTooltipToLines = (tooltip: string, maxLineLength: number): string[] => {
  if (tooltip.includes('\n')) {
    return tooltip.split('\n').flatMap(line => splitTooltipToLines(line, maxLineLength));
  }
  const tokens = tooltip.split(' ');
  const lines = [];
  let currentLineTokens: string[] = [];
  for (const token of tokens) {
    if ([...currentLineTokens, token].join(' ').length < maxLineLength) {
      currentLineTokens.push(token);
    } else {
      lines.push(currentLineTokens.join(' '));
      currentLineTokens = [token];
    }
  }
  if (currentLineTokens.length > 0) {
    lines.push(currentLineTokens.join(' '));
  }
  return lines;
};
