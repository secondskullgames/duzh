import MapFactory from './MapFactory';
import UnitFactory from '../units/UnitFactory';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { check, checkState } from '@lib/utils/preconditions';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import { GameScreen } from '@main/core/GameScreen';
import MapInstance from '@main/maps/MapInstance';
import { GameConfig } from '@main/core/GameConfig';
import MusicController from '@main/sounds/MusicController';
import { MapType } from '@models/MapType';
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
    private readonly gameConfig: GameConfig,
    @inject(MusicController)
    private readonly musicController: MusicController
  ) {}

  loadFirstMap = async () => {
    const { session, unitFactory, musicController } = this;
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
    musicController.stop();
    if (map.music) {
      musicController.playMusic(map.music);
    }
  };

  loadNextMap = async () => {
    const { session, musicController } = this;
    musicController.stop();
    const nextMapIndex = session.getMapIndex() + 1;
    if (!this._hasMap(nextMapIndex)) {
      session.setScreen(GameScreen.VICTORY);
    } else {
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
        musicController.playMusic(map.music);
      }
    }
  };

  loadPreviousMap = async () => {
    const { musicController, session } = this;
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
      musicController.playMusic(map.music);
    }
  };

  loadDebugMap = async () => {
    const { session, musicController, mapFactory, unitFactory } = this;

    const map = await mapFactory.loadMap({ type: MapType.PREDEFINED, id: 'test' });
    session.setMap(map);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    session.setPlayerUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    musicController.stop();
    updateRevealedTiles(session.getMap(), session.getPlayerUnit());
  };

  private _loadMap = async (mapIndex: number): Promise<MapInstance> => {
    const { state, gameConfig, mapFactory } = this;
    const mapSpecs = gameConfig.mapSpecs;
    check(this._hasMap(mapIndex));
    if (!state.isMapLoaded(mapIndex)) {
      const mapSpec = mapSpecs[mapIndex];
      const map = await mapFactory.loadMap(mapSpec);
      state.setMap(mapIndex, map);
    }
    return state.getMap(mapIndex);
  };

  private _hasMap = (mapIndex: number): boolean => {
    const mapSpecs = this.gameConfig.mapSpecs;
    return mapIndex >= 0 && mapIndex < mapSpecs.length;
  };
}
