import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

export const loadNextMap = async (session: Session, state: GameState) => {
  if (!state.hasNextMap(session.getMapIndex())) {
    Music.stop();
    session.setScreen(GameScreen.VICTORY);
  } else {
    const nextMapIndex = session.getMapIndex() + 1;
    session.setMapIndex(nextMapIndex);
    const map = await state.loadMap(nextMapIndex);
    session.setMap(map);
    updateRevealedTiles(session);
    //session.getPlayerUnit().setCoordinates(map.getStartingCoordinates());
    if (map.music) {
      Music.playMusic(map.music);
    }
  }
};
