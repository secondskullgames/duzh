import { z } from 'zod';
import { FogOfWarParams } from './FogOfWarParams.js';

export enum Algorithm {
  ROOMS_AND_CORRIDORS = 'ROOMS_AND_CORRIDORS',
  DEFAULT = 'DEFAULT',
  PATH = 'PATH',
  BLOB = 'BLOB',
  RANDOM = 'RANDOM'
}
export const Range = z.object({
  min: z.number(),
  max: z.number()
});
export type Range = z.infer<typeof Range>;

export const GeneratedMapModel = z.object({
  id: z.string(),
  levelNumber: z.number(),
  algorithm: z.enum(Algorithm),
  tileSet: z.string(),
  width: z.number(),
  height: z.number(),
  enemies: z.object({
    /* By convention, these should add up to 1.0 */
    types: z.array(
      z.object({
        chance: z.number(),
        type: z.string()
      })
    ),
    min: z.number(),
    max: z.number()
  }),
  items: Range,
  shrines: z.number(),
  fogOfWar: FogOfWarParams
});
export type GeneratedMapModel = z.infer<typeof GeneratedMapModel>;
