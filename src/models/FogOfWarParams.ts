import { z } from 'zod';

export const FogOfWarParamsSchema = z.object({
  enabled: z.boolean(),
  radius: z.number().optional(),
  spawnEnemies: z.boolean().optional(),
  spawnedUnitClass: z.string().optional(),
  spawnRate: z.number().optional(),
  maxSpawnedUnits: z.number().optional()
});
export type FogOfWarParams = z.infer<typeof FogOfWarParamsSchema>;
