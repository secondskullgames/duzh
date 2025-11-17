import { z } from 'zod';
import { ConsumableType } from './ConsumableType';

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
  tooltip: z.string().optional(),
});

export type ConsumableItemModel = z.infer<typeof ConsumableItemModelSchema>;