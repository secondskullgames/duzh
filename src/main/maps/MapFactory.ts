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
import { buildPredefinedMap } from './predefined/buildPredefinedMap';
import { randChoice } from '../utils/random';
import TileFactory from '../tiles/TileFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../entities/units/UnitFactory';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import ObjectFactory from '../entities/objects/ObjectFactory';

type Props = Readonly<{
  imageFactory: ImageFactory,
  unitFactory: UnitFactory,
  itemFactory: ItemFactory,
  spriteFactory: SpriteFactory,
  tileFactory: TileFactory,
  objectFactory: ObjectFactory
}>;

type Context = Readonly<{
  state: GameState,
}>;

type MapStyle = Readonly<{
  tileSet: string,
  layout: string
}>;

namespace MapStyle {
  export const equals = (first: MapStyle, second: MapStyle) => {
    return first.tileSet === second.tileSet
      && first.layout === second.layout;
  };
}

export default class MapFactory {
  private readonly unitFactory: UnitFactory;
  private readonly imageFactory: ImageFactory;
  private readonly itemFactory: ItemFactory;
  private readonly spriteFactory: SpriteFactory;
  private readonly tileFactory: TileFactory;
  private readonly objectFactory: ObjectFactory;
  private readonly usedMapStyles: MapStyle[] = [];

  constructor({ imageFactory, unitFactory, itemFactory, spriteFactory, tileFactory, objectFactory }: Props) {
    this.imageFactory = imageFactory;
    this.unitFactory = unitFactory;
    this.itemFactory = itemFactory;
    this.spriteFactory = spriteFactory;
    this.tileFactory = tileFactory;
    this.objectFactory = objectFactory;
  }

  loadMap = async (mapSpec: MapSpec, { state }: Context): Promise<MapInstance> => {
    const mapId = mapSpec.id;
    switch (mapSpec.type) {
      case 'generated': {
        const mapModel = await loadGeneratedMapModel(mapId);
        const mapBuilder = await this._loadGeneratedMap(mapId, mapModel);
        return mapBuilder.build({
          state,
          unitFactory: this.unitFactory,
          itemFactory: this.itemFactory
        });
      }
      case 'predefined': {
        return this._loadPredefinedMap(mapId, { state });
      }
    }
  };

  private _loadGeneratedMap = async (mapId: string, model: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
    const style = this._chooseMapStyle();
    const dungeonGenerator = this._getDungeonGenerator(style.layout);
    return dungeonGenerator.generateMap(mapId, model, style.tileSet);
  };

  private _loadPredefinedMap = async (mapId: string, { state }: Context): Promise<MapInstance> => {
    return buildPredefinedMap(mapId, {
      state,
      imageFactory: this.imageFactory,
      spriteFactory: this.spriteFactory,
      itemFactory: this.itemFactory,
      unitFactory: this.unitFactory,
      tileFactory: this.tileFactory,
      objectFactory: this.objectFactory
    });
  };

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
  }

  private _chooseMapStyle = (): MapStyle => {
    while (true) {
      const layout = randChoice([
        //'ROOMS_AND_CORRIDORS',
        'ROOMS_AND_CORRIDORS_3',
        'PATH',
        'BLOB',
      ])
      const tileSet = randChoice(this.tileFactory.getTileSetNames());
      const chosenStyle = { layout, tileSet };
      if (!this.usedMapStyles.some(style => MapStyle.equals(style, chosenStyle))) {
        this.usedMapStyles.push(chosenStyle);
        return chosenStyle;
      }
    }
  }
};
