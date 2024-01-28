import { loadNextMap } from './loadNextMap';
import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const startGame = async ({ state, session }: Context) => {
  await loadNextMap({ state, session });
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ session, map: session.getMap() });
};
