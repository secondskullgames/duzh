import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';
import { checkState } from '../utils/preconditions';

export const loadPreviousMap = async (session: Session, state: GameState) => {
  checkState(session.getMapIndex() > 0);
  const previousMapIndex = session.getMapIndex() - 1;
  session.setMapIndex(previousMapIndex);
  const map = await state.loadMap(previousMapIndex);
  session.setMap(map);
  updateRevealedTiles(session);
  //session.getPlayerUnit().setCoordinates(map.getStartingCoordinates());
  if (map.music) {
    Music.playMusic(map.music);
  }
};