import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

export const loadNextMap = async (session: Session, state: GameState) => {
  Music.stop();
  if (!state.hasNextMap(session.getMapIndex())) {
    session.setScreen(GameScreen.VICTORY);
  } else {
    const nextMapIndex = session.getMapIndex() + 1;
    session.setMapIndex(nextMapIndex);
    const map = await state.loadMap(nextMapIndex);
    session.setMap(map);
    updateRevealedTiles(session);
    // TODO really need some bidirectional magic
    const playerUnit = session.getPlayerUnit();
    playerUnit.getMap().removeUnit(playerUnit);
    playerUnit.setCoordinates(map.getStartingCoordinates());
    playerUnit.setMap(map);
    map.addUnit(playerUnit);
    if (map.music) {
      Music.playMusic(map.music);
    }
  }
};
