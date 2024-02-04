import { updateRevealedTiles } from './updateRevealedTiles';
import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const startGameDebug = async (mapInstance: MapInstance, { session }: Context) => {
  // eslint-disable-next-line no-console
  console.log('debug mode');
  session.setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles(session);
};
