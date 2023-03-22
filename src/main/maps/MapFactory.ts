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
import TileFactory from '../tiles/TileFactory';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import ItemFactory from '../items/ItemFactory';
import SpawnerFactory from '../entities/objects/SpawnerFactory';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import UnitFactory from '../entities/units/UnitFactory';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  itemFactory: ItemFactory,
  spawnerFactory: SpawnerFactory,
  spriteFactory: SpriteFactory,
  tileFactory: TileFactory,
  unitFactory: UnitFactory,
}>;

export default class MapFactory {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly itemFactory: ItemFactory;
  private readonly spawnerFactory: SpawnerFactory;
  private readonly spriteFactory: SpriteFactory;
  private readonly tileFactory: TileFactory;
  private readonly unitFactory: UnitFactory;

  constructor(props: Props) {
    this.state = props.state;
    this.imageFactory = props.imageFactory;
    this.itemFactory = props.itemFactory;
    this.spawnerFactory = props.spawnerFactory;
    this.spriteFactory = props.spriteFactory;
    this.tileFactory = props.tileFactory;
    this.unitFactory = props.unitFactory;
  }

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

  private loadPredefinedMap = async (mapClass: string): Promise<MapInstance> => {
    const {
      state,
      imageFactory,
      itemFactory,
      spawnerFactory,
      spriteFactory,
      unitFactory,
      tileFactory
    } = this;

    const builder =  new PredefinedMapBuilder({
      state,
      imageFactory,
      itemFactory,
      spawnerFactory,
      spriteFactory,
      unitFactory,
      tileFactory
    });

    return builder.build(mapClass);
  }

  private _getDungeonGenerator = (mapLayout: string, tileSet: TileSet): AbstractMapGenerator => {
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