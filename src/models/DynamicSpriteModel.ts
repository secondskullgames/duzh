import { z } from 'zod';

export const DynamicSpriteAnimationSchema = z.object({
  frames: z.array(
    z.object({
      activity: z.string(),
      number: z.string()
    })
  ),
  pattern: z.string().optional()
});
export type DynamicSpriteAnimation = z.infer<typeof DynamicSpriteAnimationSchema>;

export const DynamicSpriteOffsetsSchema = z.object({
  dx: z.number(),
  dy: z.number()
});
export type DynamicSpriteOffsets = z.infer<typeof DynamicSpriteOffsetsSchema>;

export const DynamicSpriteModelSchema = z.object({
  animations: z.record(z.string(), DynamicSpriteAnimationSchema),
  name: z.string(),
  offsets: DynamicSpriteOffsetsSchema,
  pattern: z.string().optional(),
  patterns: z.array(z.string()).optional(),
  transparentColor: z.string().optional()
});
export type DynamicSpriteModel = z.infer<typeof DynamicSpriteModelSchema>;
