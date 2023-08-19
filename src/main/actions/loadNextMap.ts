import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import MapFactory from '../maps/MapFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  mapFactory: MapFactory,
  imageFactory: ImageFactory,
  spriteFactory: SpriteFactory
}>;

export const loadNextMap = async ({ state, mapFactory, imageFactory, spriteFactory }: Context) => {
  if (!state.hasNextMap()) {
    Music.stop();
    state.setScreen(GameScreen.VICTORY);
  } else {
    await state.loadNextMap({ state, mapFactory, imageFactory, spriteFactory });
    const map = state.getMap();
    updateRevealedTiles({ state, map: map })
    if (map.music) {
      await Music.playMusic(map.music);
    }
  }
};