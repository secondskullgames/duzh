import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameState from '../core/GameState';

type Context = Readonly<{
  state: GameState
}>;

export const startGameDebug = async (
  mapInstance: MapInstance,
  { state }: Context
) => {
  console.log('debug mode');
  state.setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state });
};