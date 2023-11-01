import { loadNextMap } from './loadNextMap';
import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import GameState from '../core/GameState';

type Context = Readonly<{
  state: GameState;
}>;

export const startGame = async ({ state }: Context) => {
  await loadNextMap({ state });
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state, map: state.getMap() });
};
