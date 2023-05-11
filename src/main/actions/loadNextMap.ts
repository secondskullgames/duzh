import Music from '../sounds/Music';
import { GameScreen } from '../types/types';
import { updateRevealedTiles } from './updateRevealedTiles';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState
}>;

export const loadNextMap = async ({ state }: Props) => {
  if (!state.hasNextMap()) {
    Music.stop();
    state.setScreen(GameScreen.VICTORY);
  } else {
    const t1 = new Date().getTime();
    const nextMap = await state.loadNextMap();
    state.setMap(nextMap);
    updateRevealedTiles({ state })
    if (nextMap.music) {
      await Music.playMusic(nextMap.music);
    }
    const t2 = new Date().getTime();
    console.debug(`Loaded level in ${t2 - t1} ms`);
  }
};