import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const loadNextMap = async ({ state, session }: Context) => {
  if (!state.hasNextMap()) {
    Music.stop();
    session.setScreen(GameScreen.VICTORY);
  } else {
    const nextMapIndex = state.getMapIndex() + 1;
    await state.setMapIndex(nextMapIndex);
    const map = state.getMap();
    updateRevealedTiles({ session, map });
    if (map.music) {
      await Music.playMusic(map.music);
    }
  }
};
