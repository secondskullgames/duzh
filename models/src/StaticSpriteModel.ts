import { z } from 'zod';

export const StaticSpriteOffsets = z.object({
  dx: z.number(),
  dy: z.number()
});
export type StaticSpriteOffsets = z.infer<typeof StaticSpriteOffsets>;

export const StaticSpriteModel = z.object({
  id: z.string(),
  filename: z.string(),
  offsets: StaticSpriteOffsets,
  transparentColor: z.string(),
  paletteSwaps: z.record(z.string(), z.string()).optional()
});
export type StaticSpriteModel = z.infer<typeof StaticSpriteModel>;
