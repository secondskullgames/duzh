type EquipmentSlot = 'MELEE_WEAPON' | 'RANGED_WEAPON' | 'CHEST' | 'HEAD' | 'SHIELD' | 'LEGS' | 'CLOAK';

namespace EquipmentSlot {
  export const toString = (slot: EquipmentSlot) => slot.replace('_', ' ');
}

export default EquipmentSlot;
