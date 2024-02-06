import { Graphics } from '../Graphics';

export interface Renderer {
  render: (graphics: Graphics) => Promise<void>;
}
