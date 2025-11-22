import z from 'zod';

export const TileSetModelSchema = z.object({
  path: z.string(),
  tiles: z.record(z.string(), z.array(z.string().nullable())), // TODO should be TileTypeSchema
  paletteSwaps: z.record(z.string(), z.string()).optional()
});
export type TileSetModel = z.infer<typeof TileSetModelSchema>;
