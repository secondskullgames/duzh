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
  const playerUnit = session.getPlayerUnit();
  playerUnit.getMap().removeUnit(playerUnit);
  playerUnit.setMap(map);
  map.addUnit(playerUnit);
  playerUnit.setCoordinates(map.getStartingCoordinates());
  updateRevealedTiles(map, playerUnit);
  if (map.music) {
    Music.playMusic(map.music);
  }
};
