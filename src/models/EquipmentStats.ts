import { z } from 'zod';

export const EquipmentStatsSchema = z.object({
  /**
   * The ratio of damage blocked by this item
   */
  absorbAmount: z.number().optional(),
  /**
   * The ratio of frontal melee damage blocked by this item.
   * Mostly used by shields. Additive with absorbAmount.
   */
  blockAmount: z.number().optional(),
  damage: z.number().optional()
});
