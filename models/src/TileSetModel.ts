import { z } from 'zod';
import { TileTypeSchema } from './TileType.js';

export const TileSetModelSchema = z.object({
  path: z.string(),
  tiles: z.record(z.string(), z.array(TileTypeSchema.nullable())),
  paletteSwaps: z.record(z.string(), z.string()).optional()
});
export type TileSetModel = z.infer<typeof TileSetModelSchema>;
