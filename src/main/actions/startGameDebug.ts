import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import { GlobalContext } from '../core/GlobalContext';

export const startGameDebug = async (
  mapInstance: MapInstance,
  { state }: GlobalContext
) => {
  console.log('debug mode');
  state.setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state });
};