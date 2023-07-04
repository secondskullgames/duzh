import { loadGeneratedMapModel } from '../utils/models';
import BlobMapGenerator from './generated/BlobMapGenerator';
import AbstractMapGenerator from './generated/AbstractMapGenerator';
import RoomCorridorMapGenerator from './generated/room_corridor/RoomCorridorMapGenerator';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import RoomCorridorMapGenerator2 from './generated/room_corridor_rewrite/RoomCorridorMapGenerator2';
import PathMapGenerator from './generated/PathMapGenerator';
import RoomCorridorMapGenerator3 from './generated/RoomCorridorMapGenerator3';
import MapInstance from './MapInstance';
import MapSpec from '../schemas/MapSpec';
import GeneratedMapModel from '../schemas/GeneratedMapModel';
import { buildPredefinedMap } from './predefined/buildPredefinedMap';
import { GlobalContext } from '../core/GlobalContext';


const loadMap = async (mapSpec: MapSpec, context: GlobalContext): Promise<MapInstance> => {
  switch (mapSpec.type) {
    case 'generated': {
      const mapClass = await loadGeneratedMapModel(mapSpec.id);
      const mapBuilder = await loadGeneratedMap(mapClass, context);
      return mapBuilder.build(context);
    }
    case 'predefined': {
      return loadPredefinedMap(mapSpec.id, context);
    }
  }
};

const loadGeneratedMap = async (mapClass: GeneratedMapModel, context: GlobalContext): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = getDungeonGenerator(mapClass.layout);
  return dungeonGenerator.generateMap(mapClass, context);
};

const loadPredefinedMap = async (mapId: string, context: GlobalContext): Promise<MapInstance> => {
  return buildPredefinedMap(mapId, context);
};

const getDungeonGenerator = (mapLayout: string): AbstractMapGenerator => {
  switch (mapLayout) {
    case 'ROOMS_AND_CORRIDORS': {
      const useNewMapGenerator = true;
      if (useNewMapGenerator) {
        return new RoomCorridorMapGenerator2();
      }
      const minRoomDimension = 3;
      const maxRoomDimension = 7;
      return new RoomCorridorMapGenerator({
        minRoomDimension,
        maxRoomDimension
      });
    }
    case 'ROOMS_AND_CORRIDORS_3': {
      return new RoomCorridorMapGenerator3();
    }
    case 'BLOB':
      return new BlobMapGenerator();
    case 'PATH':
      return new PathMapGenerator();
    default:
      throw new Error(`Unknown map layout ${mapLayout}`);
  }
};

export default {
  loadMap
};