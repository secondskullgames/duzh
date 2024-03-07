import MapFactory from './MapFactory';
import UnitFactory from '../entities/units/UnitFactory';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { check, checkState } from '@main/utils/preconditions';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import { GameScreen } from '@main/core/GameScreen';
import MapInstance from '@main/maps/MapInstance';
import { GameConfig } from '@main/core/GameConfig';
import { inject, injectable } from 'inversify';

export interface MapController {
  loadFirstMap: () => Promise<void>;
  loadNextMap: () => Promise<void>;
  loadPreviousMap: () => Promise<void>;
  loadDebugMap: () => Promise<void>;
}

export const MapController = Symbol('MapController');

@injectable()
export class MapControllerImpl implements MapController {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState,
    @inject(MapFactory)
    private readonly mapFactory: MapFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(GameConfig)
    private readonly gameConfig: GameConfig
  ) {}

  loadFirstMap = async () => {
    const { state, session, unitFactory } = this;
    checkState(session.getMapIndex() === -1);
    session.setMapIndex(0);
    const map = await this._loadMap(0);
    session.setMap(map);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    session.setPlayerUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    state.getMusicController().stop();
    if (map.music) {
      state.getMusicController().playMusic(map.music);
    }
  };

  loadNextMap = async () => {
    const { state, session } = this;
    state.getMusicController().stop();
    if (!this._hasMap(session.getMapIndex() + 1)) {
      session.setScreen(GameScreen.VICTORY);
    } else {
      const nextMapIndex = session.getMapIndex() + 1;
      session.setMapIndex(nextMapIndex);
      const map = await this._loadMap(nextMapIndex);
      session.setMap(map);
      // TODO really need some bidirectional magic
      const playerUnit = session.getPlayerUnit();
      playerUnit.getMap().removeUnit(playerUnit);
      playerUnit.setCoordinates(map.getStartingCoordinates());
      playerUnit.setMap(map);
      map.addUnit(playerUnit);
      updateRevealedTiles(map, playerUnit);
      if (map.music) {
        state.getMusicController().playMusic(map.music);
      }
    }
  };

  loadPreviousMap = async () => {
    const { state, session } = this;
    checkState(session.getMapIndex() > 0);
    const previousMapIndex = session.getMapIndex() - 1;
    session.setMapIndex(previousMapIndex);
    const map = await this._loadMap(previousMapIndex);
    session.setMap(map);
    const playerUnit = session.getPlayerUnit();
    playerUnit.getMap().removeUnit(playerUnit);
    playerUnit.setMap(map);
    map.addUnit(playerUnit);
    playerUnit.setCoordinates(map.getStartingCoordinates());
    updateRevealedTiles(map, playerUnit);
    if (map.music) {
      state.getMusicController().playMusic(map.music);
    }
  };

  loadDebugMap = async () => {
    const { session, state, mapFactory, unitFactory } = this;

    const map = await mapFactory.loadMap({ type: 'predefined', id: 'test' });
    // eslint-disable-next-line no-console
    console.log('debug mode');
    session.setMap(map);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    session.setPlayerUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    state.getMusicController().stop();
    // state.getMusicController().playFigure(TITLE_THEME);
    // state.getMusicController().playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    updateRevealedTiles(session.getMap(), session.getPlayerUnit());
  };

  private _loadMap = async (mapIndex: number): Promise<MapInstance> => {
    const mapSpecs = this.gameConfig.mapSpecs;
    check(this._hasMap(mapIndex));
    if (!this.state.isMapLoaded(mapIndex)) {
      const mapSpec = mapSpecs[mapIndex];
      const map = await this.mapFactory.loadMap(mapSpec);
      this.state.setMap(mapIndex, map);
    }
    return this.state.getMap(mapIndex);
  };

  private _hasMap = (mapIndex: number): boolean => {
    const mapSpecs = this.gameConfig.mapSpecs;
    return mapIndex >= 0 && mapIndex < mapSpecs.length;
  };
}
