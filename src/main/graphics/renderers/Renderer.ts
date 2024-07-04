import { Graphics } from '@lib/graphics/Graphics';

/**
 * TODO: This is dubious now that {@link Scene}s now do their own rendering
 */
export interface Renderer {
  render: (graphics: Graphics) => Promise<void>;
}
