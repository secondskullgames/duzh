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
import TileFactory from '../tiles/TileFactory';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import ItemFactory from '../items/ItemFactory';
import ObjectFactory from '../entities/objects/ObjectFactory';
import UnitFactory from '../entities/units/UnitFactory';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  itemFactory: ItemFactory,
  objectFactory: ObjectFactory,
  tileFactory: TileFactory,
  unitFactory: UnitFactory,
}>;

export default class MapFactory {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly itemFactory: ItemFactory;
  private readonly objectFactory: ObjectFactory;
  private readonly tileFactory: TileFactory;
  private readonly unitFactory: UnitFactory;

  constructor(props: Props) {
    this.state = props.state;
    this.imageFactory = props.imageFactory;
    this.itemFactory = props.itemFactory;
    this.objectFactory = props.objectFactory;
    this.tileFactory = props.tileFactory;
    this.unitFactory = props.unitFactory;
  }

  loadMap = async (mapSpec: MapSpec): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case 'generated': {
        const mapClass = await loadGeneratedMapModel(mapSpec.id);
        const mapBuilder = await this.loadGeneratedMap(mapClass);
        return mapBuilder.build();
      }
      case 'predefined': {
        return this.loadPredefinedMap(mapSpec.id);
      }
    }
  };

  private loadGeneratedMap = async (mapClass: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
    const dungeonGenerator = this._getDungeonGenerator(mapClass.layout);
    return dungeonGenerator.generateMap(mapClass);
  };

  private loadPredefinedMap = async (mapId: string): Promise<MapInstance> => {
    const {
      state,
      imageFactory,
      itemFactory,
      objectFactory,
      unitFactory,
      tileFactory
    } = this;

    const mapBuilder = new PredefinedMapBuilder({
      state,
      imageFactory,
      itemFactory,
      objectFactory,
      unitFactory,
      tileFactory
    });

    return mapBuilder.build(mapId);
  }

  private _getDungeonGenerator = (mapLayout: string): AbstractMapGenerator => {
    const { tileFactory } = this;
    switch (mapLayout) {
      case 'ROOMS_AND_CORRIDORS': {
        const useNewMapGenerator = true;
        if (useNewMapGenerator) {
          return new RoomCorridorMapGenerator2({ tileFactory });
        }
        const minRoomDimension = 3;
        const maxRoomDimension = 7;
        return new RoomCorridorMapGenerator({
          tileFactory,
          minRoomDimension,
          maxRoomDimension
        });
      }
      case 'ROOMS_AND_CORRIDORS_3': {
        return new RoomCorridorMapGenerator3({ tileFactory });
      }
      case 'BLOB':
        return new BlobMapGenerator({ tileFactory });
      case 'PATH':
        return new PathMapGenerator({ tileFactory });
      default:
        throw new Error(`Unknown map layout ${mapLayout}`);
    }
  };
}