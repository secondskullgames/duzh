import { loadNextMap } from './loadNextMap';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameRenderer from '../graphics/renderers/GameRenderer';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export const startGame = async ({ state, renderer }: Props) => {
  const t1 = new Date().getTime();
  await loadNextMap({ state });
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state });
  await renderer.render();
  const t2 = new Date().getTime();
  console.debug(`Loaded level in ${t2 - t1} ms`);
};