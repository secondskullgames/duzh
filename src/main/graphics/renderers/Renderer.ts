import { Graphics } from '@lib/graphics/Graphics';

export interface Renderer {
  render: (graphics: Graphics) => Promise<void>;
}
