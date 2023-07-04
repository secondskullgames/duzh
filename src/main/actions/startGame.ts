import { loadNextMap } from './loadNextMap';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import { GlobalContext } from '../core/GlobalContext';

export const startGame = async (context: GlobalContext) => {
  const t1 = new Date().getTime();
  await loadNextMap(context);
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles(context);
  const t2 = new Date().getTime();
  console.debug(`Loaded level in ${t2 - t1} ms`);
};