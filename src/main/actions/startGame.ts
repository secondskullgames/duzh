import { loadNextMap } from './loadNextMap';
import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
import MapFactory from '../maps/MapFactory';

type Context = Readonly<{
  game: Game,
  mapFactory: MapFactory,
  imageFactory: ImageFactory
}>;

export const startGame = async ({ game, mapFactory, imageFactory }: Context) => {
  const t1 = new Date().getTime();
  await loadNextMap({ game, mapFactory, imageFactory });
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  updateRevealedTiles({ game, map: game.getMap() });
  const t2 = new Date().getTime();
  console.debug(`Loaded level in ${t2 - t1} ms`);
};