import { z } from 'zod';

import { ItemCategory } from './ItemCategory.js';

export enum EquipmentSlot {
  MELEE_WEAPON = 'MELEE_WEAPON',
  RANGED_WEAPON = 'RANGED_WEAPON',
  CHEST = 'CHEST',
  HEAD = 'HEAD',
  SHIELD = 'SHIELD',
  LEGS = 'LEGS',
  CLOAK = 'CLOAK'
}

export const EquipmentCategorySchema = z.union([
  z.literal(ItemCategory.ARMOR),
  z.literal(ItemCategory.WEAPON)
]);
export type EquipmentCategory = z.infer<typeof EquipmentCategorySchema>;

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

export const EquipmentModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  itemCategory: EquipmentCategorySchema,
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
