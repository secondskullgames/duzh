import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';

type Context = Readonly<{
  state: GameState
}>;

export const loadNextMap = async ({ state }: Context) => {
  if (!state.hasNextMap()) {
    Music.stop();
    state.setScreen(GameScreen.VICTORY);
  } else {
    const nextMapIndex = state.getMapIndex() + 1;
    await state.setMapIndex(nextMapIndex);
    const map = state.getMap();
    updateRevealedTiles({ state, map: map })
    if (map.music) {
      await Music.playMusic(map.music);
    }
  }
};