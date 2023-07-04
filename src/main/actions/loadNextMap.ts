import Music from '../sounds/Music';
import { updateRevealedTiles } from './updateRevealedTiles';
import { GameScreen } from '../core/GameScreen';
import { GlobalContext } from '../core/GlobalContext';

export const loadNextMap = async (context: GlobalContext) => {
  const { state } = context;
  if (!state.hasNextMap()) {
    Music.stop();
    state.setScreen(GameScreen.VICTORY);
  } else {
    const t1 = new Date().getTime();
    const nextMap = await state.loadNextMap();
    state.setMap(nextMap);
    updateRevealedTiles(context);
    if (nextMap.music) {
      await Music.playMusic(nextMap.music);
    }
    const t2 = new Date().getTime();
    console.debug(`Loaded level in ${t2 - t1} ms`);
  }
};