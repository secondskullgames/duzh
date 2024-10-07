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
  loadFirstMap: () => Promise<void>;
  loadNextMap: () => Promise<void>;
  loadPreviousMap: () => Promise<void>;
  loadDebugMap: () => Promise<void>;
  reset: () => void;
}

export const MapController = Symbol('MapController');

@injectable()
export class MapControllerImpl implements MapController {
  private readonly maps: Record<string, MapInstance>;

  constructor(
    @inject(Game)
    private readonly game: Game,
    @inject(MapFactory)
    private readonly mapFactory: MapFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(MusicController)
    private readonly musicController: MusicController
  ) {
    this.maps = {};
  }

  loadFirstMap = async () => {
    const { unitFactory, musicController } = this;
    const { session } = this.game;
    const map = await this._loadMap(this.game.config.mapSpecs[0].id);
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
    const currentMap = session.getPlayerUnit().getMap();
    musicController.stop();
    const { mapSpecs } = this.game.config;
    const nextMapIndex = mapSpecs.findIndex(spec => spec.id === currentMap.id) + 1;
    if (nextMapIndex >= mapSpecs.length) {
      session.endGameTimer();
      session.setScene(SceneName.VICTORY);
    } else {
      const map = await this._loadMap(mapSpecs[nextMapIndex].id);
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
    const { mapSpecs } = this.game.config;
    const playerUnit = session.getPlayerUnit();
    const currentMap = playerUnit.getMap();
    const previousMapIndex = mapSpecs.findIndex(spec => spec.id === currentMap.id) - 1;
    const map = await this._loadMap(mapSpecs[previousMapIndex].id);
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
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    session.setPlayerUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    musicController.stop();
    updateRevealedTiles(map, session.getPlayerUnit());
  };

  private _loadMap = async (mapId: string): Promise<MapInstance> => {
    const { mapFactory } = this;
    const { config } = this.game;
    const mapSpec = checkNotNull(config.mapSpecs.find(spec => spec.id === mapId));
    const id = mapSpec.id;
    if (!this.maps[id]) {
      this.maps[id] = await mapFactory.loadMap(mapSpec, this.game);
    }
    return checkNotNull(this.maps[id]);
  };

  reset = () => {
    Object.keys(this.maps).forEach(key => {
      delete this.maps[key];
    });
  };
}
