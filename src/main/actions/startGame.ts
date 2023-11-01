import { loadNextMap } from './loadNextMap';
import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import GameState from '../core/GameState';

type Context = Readonly<{
  state: GameState,
}>;

export const startGame = async ({ state }: Context) => {
  const t1 = new Date().getTime();
  await loadNextMap({ state });
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state, map: state.getMap() });
  const t2 = new Date().getTime();
  // eslint-disable-next-line no-console
  console.debug(`Loaded level in ${t2 - t1} ms`);
};