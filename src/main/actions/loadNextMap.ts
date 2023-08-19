import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import MapFactory from '../maps/MapFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import ItemFactory from '../items/ItemFactory';

type Context = Readonly<{
  state: GameState,
  mapFactory: MapFactory,
  imageFactory: ImageFactory,
  spriteFactory: SpriteFactory,
  itemFactory: ItemFactory
}>;

export const loadNextMap = async (context: Context) => {
  const { state, mapFactory, imageFactory, itemFactory, spriteFactory } = context;
  if (!state.hasNextMap()) {
    Music.stop();
    state.setScreen(GameScreen.VICTORY);
  } else {
    await state.loadNextMap({ state, mapFactory, imageFactory, itemFactory, spriteFactory });
    const map = state.getMap();
    updateRevealedTiles({ state, map });
    if (map.music) {
      await Music.playMusic(map.music);
    }
  }
};