import { z } from 'zod';

export const DynamicSpriteAnimationModel = z.object({
  frames: z.array(
    z.object({
      activity: z.string(),
      number: z.string()
    })
  ),
  pattern: z.string().optional()
});
export type DynamicSpriteAnimationModel = z.infer<typeof DynamicSpriteAnimationModel>;

export const DynamicSpriteOffsetsModel = z.object({
  dx: z.number(),
  dy: z.number()
});
export type DynamicSpriteOffsetsModel = z.infer<typeof DynamicSpriteOffsetsModel>;

export const DynamicSpriteModel = z.object({
  animations: z.record(z.string(), DynamicSpriteAnimationModel),
  id: z.string(),
  offsets: DynamicSpriteOffsetsModel,
  pattern: z.string().optional(),
  patterns: z.array(z.string()).optional(),
  transparentColor: z.string().optional()
});
export type DynamicSpriteModel = z.infer<typeof DynamicSpriteModel>;
