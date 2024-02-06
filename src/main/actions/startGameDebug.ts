import { updateRevealedTiles } from './updateRevealedTiles';
import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { Session } from '../core/Session';

export const startGameDebug = async (mapInstance: MapInstance, session: Session) => {
  // eslint-disable-next-line no-console
  console.log('debug mode');
  session.setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles(session.getMap(), session.getPlayerUnit());
};
