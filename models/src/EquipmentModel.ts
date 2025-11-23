import { z } from 'zod';

import { EquipmentSlot } from './EquipmentSlot.js';
import { EquipmentStatsSchema } from './EquipmentStats.js';
import { ItemCategory } from './ItemCategory.js';

export const EquipmentModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  itemCategory: z.enum(ItemCategory),
  level: z.number().optional().nullable(),
  mapIcon: z.string(),
  paletteSwaps: z.record(z.string(), z.string()),
  /**
   * between 1 and 5, where 5 is most rare, or null if this should never be randomly generated
   */
  rarity: z.number().optional().nullable(),
  ability: z.string().optional(),
  script: z.string().optional(),
  slot: z.enum(EquipmentSlot),
  sprite: z.string(),
  stats: EquipmentStatsSchema,
  tooltip: z.string().optional()
});
export type EquipmentModel = z.infer<typeof EquipmentModelSchema>;
