import { GeneratedMapModel } from '../../gen-schema/generated-map.schema';
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
import MapSpec from './MapSpec';
import PredefinedMapBuilder from './predefined/PredefinedMapBuilder';
import PredefinedMapClass from './predefined/PredefinedMapClass';

const loadMap = (map: MapSpec): Promise<MapInstance> => {
  switch (map.type) {
    case 'generated': {
      return (async () => {
        const mapClass = await loadGeneratedMapModel(map.id);
        const mapBuilder = await loadGeneratedMap(mapClass);
        return mapBuilder.build();
      })();
    }
    case 'predefined': {
      return (async () => {
        const mapClass = await PredefinedMapClass.load(map.id);
        return loadPredefinedMap(mapClass);
      })();
    }
  }
};

const loadGeneratedMap = async (mapClass: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = _getDungeonGenerator(mapClass.layout, await TileSet.load(mapClass.tileSet));
  return dungeonGenerator.generateMap(mapClass);
};

const loadPredefinedMap = async (mapClass: PredefinedMapClass): Promise<MapInstance> =>
  new PredefinedMapBuilder(mapClass).build();

const _getDungeonGenerator = (mapLayout: string, tileSet: TileSet): AbstractMapGenerator => {
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

export default {
  loadMap
};
