import { FogOfWarParamsSchema } from './FogOfWarParams';
import { z } from 'zod';

const StringMapSchema = z.record(z.string(), z.string());

export const PredefinedMapModelSchema = z.object({
  id: z.string(),
  imageFilename: z.string(),
  levelNumber: z.number(),
  music: z.string().optional(),
  startingPointColor: z.string(),
  tileColors: z.record(z.string(), z.string()), // TODO should be TileTypeSchema
  enemyColors: StringMapSchema,
  equipmentColors: StringMapSchema.optional(),
  itemColors: StringMapSchema.optional(),
  objectColors: StringMapSchema.optional(),
  defaultTile: z.string(), // TODO should be TileTypeSchema
  tileset: z.string(),
  fogOfWar: FogOfWarParamsSchema
});
export type PredefinedMapModel = z.infer<typeof PredefinedMapModelSchema>;
