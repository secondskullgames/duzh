import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameRenderer from '../graphics/renderers/GameRenderer';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export const startGameDebug = async (mapInstance: MapInstance, { state, renderer }: Props) => {
  console.log('debug mode');
  state.setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state });
  await renderer.render();
};