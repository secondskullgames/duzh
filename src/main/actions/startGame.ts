import { loadNextMap } from './loadNextMap';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameState from '../core/GameState';
import MapFactory from '../maps/MapFactory';

type Context = Readonly<{
  state: GameState,
  mapFactory: MapFactory
}>;

export const startGame = async ({ state, mapFactory }: Context) => {
  const t1 = new Date().getTime();
  await loadNextMap({ state, mapFactory });
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state, map: state.getMap() });
  const t2 = new Date().getTime();
  console.debug(`Loaded level in ${t2 - t1} ms`);
};