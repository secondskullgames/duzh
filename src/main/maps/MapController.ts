import MapFactory from './MapFactory';
import UnitFactory from '../units/UnitFactory';
import { check, checkState } from '@lib/utils/preconditions';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import { SceneName } from '@main/scenes/SceneName';
import MapInstance from '@main/maps/MapInstance';
import MusicController from '@main/sounds/MusicController';
import { MapType } from '@models/MapType';
import { Game } from '@main/core/Game';
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
    @inject(Game)
    private readonly game: Game,
    @inject(MapFactory)
    private readonly mapFactory: MapFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(MusicController)
    private readonly musicController: MusicController
  ) {}

  loadFirstMap = async () => {
    const { unitFactory, musicController } = this;
    const { session } = this.game;
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
    const { musicController } = this;
    const { session } = this.game;
    musicController.stop();
    const nextMapIndex = session.getMapIndex() + 1;
    if (!this._hasMap(nextMapIndex)) {
      session.endGameTimer();
      session.setScene(SceneName.VICTORY);
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
    const { musicController } = this;
    const { session } = this.game;
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
    const { musicController, mapFactory, unitFactory } = this;
    const { session } = this.game;

    const map = await mapFactory.loadMap(
      { type: MapType.PREDEFINED, id: 'test' },
      this.game
    );
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
    const { mapFactory } = this;
    const { state, config } = this.game;
    const mapSpecs = config.mapSpecs;
    check(this._hasMap(mapIndex));
    if (!state.isMapLoaded(mapIndex)) {
      const mapSpec = mapSpecs[mapIndex];
      const map = await mapFactory.loadMap(mapSpec, this.game);
      state.setMap(mapIndex, map);
    }
    return state.getMap(mapIndex);
  };

  private _hasMap = (mapIndex: number): boolean => {
    const mapSpecs = this.game.config.mapSpecs;
    return mapIndex >= 0 && mapIndex < mapSpecs.length;
  };
}
