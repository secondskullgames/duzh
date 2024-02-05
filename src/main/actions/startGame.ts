import { updateRevealedTiles } from './updateRevealedTiles';
import { loadFirstMap } from './loadFirstMap';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

export const startGame = async (session: Session, state: GameState) => {
  await loadFirstMap(session, state);
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles(session);
};
