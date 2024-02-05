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
    // TODO really need some bidirectional magic
    session.getPlayerUnit().getMap().removeUnit(session.getPlayerUnit());
    session.getPlayerUnit().setCoordinates(map.getStartingCoordinates());
    session.getPlayerUnit().setMap(map);
    map.addUnit(session.getPlayerUnit());
    if (map.music) {
      Music.playMusic(map.music);
    }
  }
};
