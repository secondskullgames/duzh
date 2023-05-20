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
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import { buildPredefinedMap } from './predefined/buildPredefinedMap';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

const loadMap = async (mapSpec: MapSpec, { state, imageFactory }: Context): Promise<MapInstance> => {
  switch (mapSpec.type) {
    case 'generated': {
      const mapClass = await loadGeneratedMapModel(mapSpec.id);
      const mapBuilder = await loadGeneratedMap(mapClass, { state, imageFactory });
      return mapBuilder.build({ state, imageFactory });
    }
    case 'predefined': {
      return loadPredefinedMap(mapSpec.id, { state, imageFactory });
    }
  }
};

const loadGeneratedMap = async (mapClass: GeneratedMapModel, { imageFactory }: Context): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = getDungeonGenerator(mapClass.layout);
  return dungeonGenerator.generateMap(mapClass, { imageFactory });
};

const loadPredefinedMap = async (mapId: string, { state, imageFactory }: Context): Promise<MapInstance> => {
  return buildPredefinedMap(mapId, { state, imageFactory });
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