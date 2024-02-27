import { Graphics } from '@main/graphics';

export interface Renderer {
  render: (graphics: Graphics) => Promise<void>;
}
