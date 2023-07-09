import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameState from '../core/GameState';
import MapFactory from '../maps/MapFactory';
import ImageFactory from '../graphics/images/ImageFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  mapFactory: MapFactory
}>;

export const startGameDebug = async (
  { state, imageFactory, mapFactory }: Context
) => {
  console.log('debug mode');
  const map = await mapFactory.loadMap(
    { type: 'predefined', id: 'test' },
    { state, imageFactory }
  );
  state.setMap(map);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ state, map });
};