import { Graphics } from '@lib/graphics/Graphics';
import { Game } from '@main/core/Game';

/**
 * TODO: This is dubious now that {@link Scene}s now do their own rendering
 */
export interface Renderer {
  render: (game: Game, graphics: Graphics) => Promise<void>;
}
