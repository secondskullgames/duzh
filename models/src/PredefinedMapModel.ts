import { FogOfWarParams } from './FogOfWarParams.js';
import { z } from 'zod';
import { TileType } from './TileType.js';

const StringMap = z.record(z.string(), z.string());

export const PredefinedMapModel = z.object({
  id: z.string(),
  imageFilename: z.string(),
  levelNumber: z.number(),
  music: z.string().optional(),
  startingPointColor: z.string(),
  tileColors: z.record(z.string(), z.enum(TileType)),
  enemyColors: StringMap,
  equipmentColors: StringMap.optional(),
  itemColors: StringMap.optional(),
  objectColors: StringMap.optional(),
  defaultTile: z.enum(TileType),
  tileset: z.string(),
  fogOfWar: FogOfWarParams
});
export type PredefinedMapModel = z.infer<typeof PredefinedMapModel>;
