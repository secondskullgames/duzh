import { z } from 'zod';

export enum UnitType {
  ANIMAL = 'ANIMAL',
  ELEMENTAL = 'ELEMENTAL',
  GHOST = 'GHOST',
  GOLEM = 'GOLEM',
  HUMAN = 'HUMAN',
  MECHANICAL = 'MECHANICAL',
  WIZARD = 'WIZARD'
}

export const AIParameters = z.object({
  /**
   * between 0 and 1
   */
  speed: z.number(),
  /**
   * range where this unit has some awareness of enemies
   * whole number of tiles
   */
  visionRange: z.number(),
  /**
   * chance to engage when in "medium range"
   * between 0 and 1
   */
  aggressiveness: z.number(),
  /**
   * ratio of (current life / max life)
   */
  fleeThreshold: z.number()
});

export type AIParameters = z.infer<typeof AIParameters>;

export const UnitModel = z.object({
  /**
   * Expected to match the filename
   */
  id: z.string(),
  /**
   * Human-readable name for this unit type
   */
  name: z.string(),
  abilities: z.array(z.string()),
  aiParameters: AIParameters.optional(),
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
export type UnitModel = z.infer<typeof UnitModel>;
