type EquipmentStats = {
  /**
   * The ratio of damage blocked by this item
   */
  absorbAmount?: number;
  /**
   * The ratio of frontal melee damage blocked by this item.
   * Mostly used by shields. Additive with absorbAmount.
   */
  blockAmount?: number;
  damage?: number;
};

export default EquipmentStats;
