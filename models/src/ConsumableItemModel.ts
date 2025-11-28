import { z } from 'zod';

export enum ConsumableType {
  LIFE_POTION = 'life_potion',
  MANA_POTION = 'mana_potion',
  OVERDRIVE_POTION = 'overdrive_potion',
  KEY = 'key',
  SCROLL = 'scroll'
}

export const ConsumableItemModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().optional().nullable(),
  /**
   * between 1 and 5, where 5 is most rare, or null if this should never be randomly generated
   */
  rarity: z.number().optional().nullable(),
  mapSprite: z.string(),
  paletteSwaps: z.record(z.string(), z.string()).optional(),
  type: z.enum(ConsumableType),
  params: z.record(z.string(), z.string()).optional(),
  tooltip: z.string().optional()
});

export type ConsumableItemModel = z.infer<typeof ConsumableItemModelSchema>;
