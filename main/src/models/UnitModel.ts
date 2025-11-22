import { UnitType } from './UnitType';
import { AIParametersSchema } from './AIParameters';
import { z } from 'zod';

export const UnitModelSchema = z.object({
  /**
   * Expected to match the filename
   */
  id: z.string(),
  /**
   * Human-readable name for this unit type
   */
  name: z.string(),
  abilities: z.array(z.string()),
  aiParameters: AIParametersSchema.optional(),
  equipment: z.array(z.string()).optional(),
  meleeDamage: z.number(),
  rangedDamage: z.number(),
  life: z.number(),
  mana: z.number(),
  paletteSwaps: z.record(z.string(), z.string()),
  sprite: z.string(),
  summonedUnitClass: z.string().optional(),
  type: z.enum(UnitType),
  /**
   * experience rewarded on death
   */
  experience: z.number().optional()
});
export type UnitModel = z.infer<typeof UnitModelSchema>;
