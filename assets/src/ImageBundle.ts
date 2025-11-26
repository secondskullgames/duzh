import { z } from 'zod';

/**
 * keys are filenames relative to `png` directory
 * values are base64 data: urls
 */
export const ImageBundleSchema = z.record(z.string(), z.string());
export type ImageBundle = z.infer<typeof ImageBundleSchema>;
