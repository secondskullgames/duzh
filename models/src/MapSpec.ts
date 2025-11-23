import { z } from 'zod';
import { MapType } from './MapType.js';

export const MapSpecSchema = z.object({
  id: z.string(),
  type: z.enum(MapType)
});
export type MapSpec = z.infer<typeof MapSpecSchema>;
