import { updateRevealedTiles } from './updateRevealedTiles';
import Music from '../sounds/Music';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';
import { checkState } from '../utils/preconditions';

export const loadFirstMap = async (session: Session, state: GameState) => {
  checkState(session.getMapIndex() === -1);
  session.setMapIndex(0);
  const map = await state.loadMap(0);
  session.setMap(map);
  const playerUnit = await state
    .getUnitFactory()
    .createPlayerUnit(map.getStartingCoordinates(), map);
  map.addUnit(playerUnit);
  session.setPlayerUnit(playerUnit);
  updateRevealedTiles(map, playerUnit);
  Music.stop();
  if (map.music) {
    Music.playMusic(map.music);
  }
};
