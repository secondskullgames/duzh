import MapFactory from './MapFactory';
import { Session } from '../core/Session';
import { GameState } from '../core/GameState';
import { checkState } from '../utils/preconditions';
import { updateRevealedTiles } from '../actions/updateRevealedTiles';
import Music from '../sounds/Music';
import { GameScreen } from '../core/GameScreen';
import { inject, injectable } from 'inversify';

export interface MapController {
  loadFirstMap: () => Promise<void>;
  loadNextMap: () => Promise<void>;
  loadPreviousMap: () => Promise<void>;
  loadDebugMap: () => Promise<void>;
}

export const MapController = {
  SYMBOL: Symbol('MapController')
};

@injectable()
export class MapControllerImpl implements MapController {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(GameState.SYMBOL)
    private readonly state: GameState,
    @inject(MapFactory)
    private readonly mapFactory: MapFactory
  ) {}

  loadFirstMap = async () => {
    const { state, session } = this;
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

  loadNextMap = async () => {
    const { state, session } = this;
    Music.stop();
    if (!state.hasNextMap(session.getMapIndex())) {
      session.setScreen(GameScreen.VICTORY);
    } else {
      const nextMapIndex = session.getMapIndex() + 1;
      session.setMapIndex(nextMapIndex);
      const map = await state.loadMap(nextMapIndex);
      session.setMap(map);
      // TODO really need some bidirectional magic
      const playerUnit = session.getPlayerUnit();
      playerUnit.getMap().removeUnit(playerUnit);
      playerUnit.setCoordinates(map.getStartingCoordinates());
      playerUnit.setMap(map);
      map.addUnit(playerUnit);
      updateRevealedTiles(map, playerUnit);
      if (map.music) {
        Music.playMusic(map.music);
      }
    }
  };

  loadPreviousMap = async () => {
    const { state, session } = this;
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

  loadDebugMap = async () => {
    const { session, state, mapFactory } = this;

    const mapInstance = await mapFactory.loadMap(
      { type: 'predefined', id: 'test' },
      state
    );
    // eslint-disable-next-line no-console
    console.log('debug mode');
    session.setMap(mapInstance);
    Music.stop();
    // Music.playFigure(Music.TITLE_THEME);
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    updateRevealedTiles(session.getMap(), session.getPlayerUnit());
  };
}