import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import Game from '../core/Game';
import { GameScreen } from '../core/GameScreen';
import MapFactory from '../maps/MapFactory';
import ImageFactory from '../graphics/images/ImageFactory';

type Context = Readonly<{
  game: Game,
  mapFactory: MapFactory,
  imageFactory: ImageFactory
}>;

export const loadNextMap = async ({ game, mapFactory, imageFactory }: Context) => {
  if (!game.hasNextMap()) {
    Music.stop();
    game.setScreen(GameScreen.VICTORY);
  } else {
    await game.loadNextMap({ game, mapFactory, imageFactory });
    const map = game.getMap();
    updateRevealedTiles({ game, map: map })
    if (map.music) {
      await Music.playMusic(map.music);
    }
  }
};