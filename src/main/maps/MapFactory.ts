import TileSet from '../tiles/TileSet';
import { loadGeneratedMapModel } from '../utils/models';
import BlobMapGenerator from './generated/BlobMapGenerator';
import AbstractMapGenerator from './generated/AbstractMapGenerator';
import RoomCorridorMapGenerator from './generated/room_corridor/RoomCorridorMapGenerator';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import RoomCorridorMapGenerator2 from './generated/room_corridor_rewrite/RoomCorridorMapGenerator2';
import PathMapGenerator from './generated/PathMapGenerator';
import RoomCorridorMapGenerator3 from './generated/RoomCorridorMapGenerator3';
import MapInstance from './MapInstance';
import PredefinedMapBuilder from './predefined/PredefinedMapBuilder';
import MapSpec from '../schemas/MapSpec';
import GeneratedMapModel from '../schemas/GeneratedMapModel';
import { checkNotNull } from '../utils/preconditions';

export default class MapFactory {
  loadMap = async (map: MapSpec): Promise<MapInstance> => {
    switch (map.type) {
      case 'generated': {
        const mapClass = await loadGeneratedMapModel(map.id);
        const mapBuilder = await this.loadGeneratedMap(mapClass);
        return mapBuilder.build();
      }
      case 'predefined': {
        return this.loadPredefinedMap(map.id);
      }
    }
  };

  private loadGeneratedMap = async (mapClass: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
    const dungeonGenerator = this._getDungeonGenerator(mapClass.layout, await TileSet.load(mapClass.tileSet));
    return dungeonGenerator.generateMap(mapClass);
  };

  private loadPredefinedMap = async (mapClass: string): Promise<MapInstance> =>
    new PredefinedMapBuilder(mapClass).build();

  private _getDungeonGenerator = (mapLayout: string, tileSet: TileSet): AbstractMapGenerator => {
    switch (mapLayout) {
      case 'ROOMS_AND_CORRIDORS': {
        const useNewMapGenerator = true;
        if (useNewMapGenerator) {
          return new RoomCorridorMapGenerator2(tileSet);
        }
        const minRoomDimension = 3;
        const maxRoomDimension = 7;
        return new RoomCorridorMapGenerator({
          tileSet,
          minRoomDimension,
          maxRoomDimension
        });
      }
      case 'ROOMS_AND_CORRIDORS_3': {
        return new RoomCorridorMapGenerator3(tileSet);
      }
      case 'BLOB':
        return new BlobMapGenerator(tileSet);
      case 'PATH':
        return new PathMapGenerator(tileSet);
      default:
        throw new Error(`Unknown map layout ${mapLayout}`);
    }
  };

  static instance: MapFactory | null = null;
  static getInstance = (): MapFactory => checkNotNull(MapFactory.instance);
  static setInstance = (factory: MapFactory) => { MapFactory.instance = factory; };
}