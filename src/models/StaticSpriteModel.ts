import z, { optional } from "zod";

export const StaticSpriteOffsetsSchema = z.object({
  dx: z.number(),
  dy: z.number()
});
export type StaticSpriteOffsets = z.infer<typeof StaticSpriteOffsetsSchema>;


export const StaticSpriteModelSchema = z.object({
  name: z.string(),
  filename: z.string(),
  offsets: StaticSpriteOffsetsSchema,
  transparentColor: z.string(),
  paletteSwaps: z.record(z.string(), z.string()).optional()
});
export type StaticSpriteModel = z.infer<typeof StaticSpriteModelSchema>;