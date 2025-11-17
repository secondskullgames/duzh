import { z } from 'zod';

export const AIParametersSchema = z.object({
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
  fleeThreshold: z.number(),
});

export type AIParameters = z.infer<typeof AIParametersSchema>;