import { z } from 'zod';
import { TileType } from './TileType.js';

export const TileSetModel = z.object({
  id: z.string(),
  path: z.string(),
  tiles: z.record(z.enum(TileType), z.array(z.string().nullable())),
  paletteSwaps: z.record(z.string(), z.string()).optional()
});
export type TileSetModel = z.infer<typeof TileSetModel>;
