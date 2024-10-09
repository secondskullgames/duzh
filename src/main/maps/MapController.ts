import MapFactory from './MapFactory';
import UnitFactory from '../units/UnitFactory';
import { checkNotNull } from '@lib/utils/preconditions';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import { SceneName } from '@main/scenes/SceneName';
import MapInstance from '@main/maps/MapInstance';
import MusicController from '@main/sounds/MusicController';
import { MapType } from '@models/MapType';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';

export interface MapController {
  loadFirstMap: (game: Game) => Promise<void>;
  loadNextMap: (game: Game) => Promise<void>;
  loadPreviousMap: (game: Game) => Promise<void>;
  loadDebugMap: (game: Game) => Promise<void>;
  reset: () => void;
}

export const MapController = Symbol('MapController');

@injectable()
export class MapControllerImpl implements MapController {
  private readonly maps: Record<string, MapInstance>;

  constructor(
    @inject(MapFactory)
    private readonly mapFactory: MapFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(MusicController)
    private readonly musicController: MusicController
  ) {
    this.maps = {};
  }

  loadFirstMap = async (game: Game) => {
    const { unitFactory, musicController } = this;
    const { state } = game;
    const map = await this._loadMap(game.config.mapSpecs[0].id, game);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    state.addUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    musicController.stop();
    if (map.music) {
      musicController.playMusic(map.music);
    }
  };

  loadNextMap = async (game: Game) => {
    const { musicController } = this;
    const { state } = game;
    const currentMap = state.getPlayerUnit().getMap();
    musicController.stop();
    const { mapSpecs } = game.config;
    const nextMapIndex = mapSpecs.findIndex(spec => spec.id === currentMap.id) + 1;
    if (nextMapIndex >= mapSpecs.length) {
      state.endGameTimer();
      state.setScene(SceneName.VICTORY);
    } else {
      const map = await this._loadMap(mapSpecs[nextMapIndex].id, game);
      // TODO really need some bidirectional magic
      const playerUnit = state.getPlayerUnit();
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

  loadPreviousMap = async (game: Game) => {
    const { musicController } = this;
    const { state } = game;
    const { mapSpecs } = game.config;
    const playerUnit = state.getPlayerUnit();
    const currentMap = playerUnit.getMap();
    const previousMapIndex = mapSpecs.findIndex(spec => spec.id === currentMap.id) - 1;
    const map = await this._loadMap(mapSpecs[previousMapIndex].id, game);
    playerUnit.getMap().removeUnit(playerUnit);
    playerUnit.setMap(map);
    map.addUnit(playerUnit);
    playerUnit.setCoordinates(map.getStartingCoordinates());
    updateRevealedTiles(map, playerUnit);
    if (map.music) {
      musicController.playMusic(map.music);
    }
  };

  loadDebugMap = async (game: Game) => {
    const { musicController, mapFactory, unitFactory } = this;
    const { state } = game;

    const map = await mapFactory.loadMap({ type: MapType.PREDEFINED, id: 'test' }, game);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    state.addUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    musicController.stop();
    updateRevealedTiles(map, state.getPlayerUnit());
  };

  private _loadMap = async (mapId: string, game: Game): Promise<MapInstance> => {
    const { mapFactory } = this;
    const { config } = game;
    const mapSpec = checkNotNull(config.mapSpecs.find(spec => spec.id === mapId));
    const id = mapSpec.id;
    if (!this.maps[id]) {
      this.maps[id] = await mapFactory.loadMap(mapSpec, game);
    }
    return checkNotNull(this.maps[id]);
  };

  reset = () => {
    Object.keys(this.maps).forEach(key => {
      delete this.maps[key];
    });
  };
}
