import { z } from 'zod';

export enum MapType {
  PREDEFINED = 'predefined',
  GENERATED = 'generated'
}

export const MapSpecSchema = z.object({
  id: z.string(),
  type: z.enum(MapType)
});
export type MapSpec = z.infer<typeof MapSpecSchema>;
