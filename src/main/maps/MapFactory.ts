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
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

const loadMap = async (mapSpec: MapSpec, { state, imageFactory }: Props): Promise<MapInstance> => {
  switch (mapSpec.type) {
    case 'generated': {
      const mapClass = await loadGeneratedMapModel(mapSpec.id);
      const mapBuilder = await loadGeneratedMap(mapClass, { state, imageFactory });
      return mapBuilder.build();
    }
    case 'predefined': {
      return loadPredefinedMap(mapSpec.id, { state, imageFactory });
    }
  }
};

const loadGeneratedMap = async (mapClass: GeneratedMapModel, { state, imageFactory }: Props): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = getDungeonGenerator(mapClass.layout, { state, imageFactory });
  return dungeonGenerator.generateMap(mapClass);
};

const loadPredefinedMap = async (mapId: string, { state, imageFactory }: Props): Promise<MapInstance> => {
  const mapBuilder = new PredefinedMapBuilder({
    state,
    imageFactory
  });

  return mapBuilder.build(mapId);
};

const getDungeonGenerator = (mapLayout: string, { state, imageFactory }: Props): AbstractMapGenerator => {
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