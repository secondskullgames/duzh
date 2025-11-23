import { FogOfWarParamsSchema } from './FogOfWarParams.js';
import { z } from 'zod';
import { TileTypeSchema } from './TileType.js';

const StringMapSchema = z.record(z.string(), z.string());

export const PredefinedMapModelSchema = z.object({
  id: z.string(),
  imageFilename: z.string(),
  levelNumber: z.number(),
  music: z.string().optional(),
  startingPointColor: z.string(),
  tileColors: z.record(z.string(), TileTypeSchema),
  enemyColors: StringMapSchema,
  equipmentColors: StringMapSchema.optional(),
  itemColors: StringMapSchema.optional(),
  objectColors: StringMapSchema.optional(),
  defaultTile: TileTypeSchema,
  tileset: z.string(),
  fogOfWar: FogOfWarParamsSchema
});
export type PredefinedMapModel = z.infer<typeof PredefinedMapModelSchema>;
