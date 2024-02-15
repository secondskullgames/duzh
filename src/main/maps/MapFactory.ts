import BlobMapGenerator from './generated/BlobMapGenerator';
import AbstractMapGenerator from './generated/AbstractMapGenerator';
import RoomCorridorMapGenerator from './generated/room_corridor/RoomCorridorMapGenerator';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import RoomCorridorMapGenerator2 from './generated/room_corridor_rewrite/RoomCorridorMapGenerator2';
import PathMapGenerator from './generated/PathMapGenerator';
import RoomCorridorMapGenerator3 from './generated/RoomCorridorMapGenerator3';
import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
import { MapSupplier } from './MapSupplier';
import MapSpec from '../schemas/MapSpec';
import GeneratedMapModel from '../schemas/GeneratedMapModel';
import { GameState } from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import { randChoice } from '../utils/random';
import TileFactory from '../tiles/TileFactory';
import ItemFactory from '../items/ItemFactory';
import ModelLoader from '../utils/models';
import { injectable } from 'inversify';

type MapStyle = Readonly<{
  tileSet: string;
  layout: string;
}>;

namespace MapStyle {
  export const equals = (first: MapStyle, second: MapStyle) => {
    return first.tileSet === second.tileSet && first.layout === second.layout;
  };
}

@injectable()
export default class MapFactory {
  private readonly usedMapStyles: MapStyle[] = [];

  constructor(
    private readonly imageFactory: ImageFactory,
    private readonly tileFactory: TileFactory,
    private readonly itemFactory: ItemFactory,
    private readonly predefinedMapFactory: PredefinedMapFactory,
    private readonly modelLoader: ModelLoader
  ) {}

  loadMap = async (mapSpec: MapSpec, state: GameState): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case 'generated': {
        const mapClass = await this.modelLoader.loadGeneratedMapModel(mapSpec.id);
        const mapBuilder = await this._loadGeneratedMap(mapClass);
        return mapBuilder.build(state);
      }
      case 'predefined': {
        return this.predefinedMapFactory.buildPredefinedMap(mapSpec.id, state);
      }
    }
  };

  loadMapSuppliers = async (
    mapSpecs: MapSpec[],
    state: GameState
  ): Promise<MapSupplier[]> => {
    const mapSuppliers: MapSupplier[] = [];
    for (const spec of mapSpecs) {
      mapSuppliers.push(async () => {
        return this.loadMap(spec, state);
      });
    }
    return mapSuppliers;
  };

  private _loadGeneratedMap = async (
    mapClass: GeneratedMapModel
  ): Promise<GeneratedMapBuilder> => {
    const style = this._chooseMapStyle();
    const dungeonGenerator = this._getDungeonGenerator(style.layout);
    return dungeonGenerator.generateMap(mapClass, style.tileSet);
  };

  private _getDungeonGenerator = (mapLayout: string): AbstractMapGenerator => {
    const { imageFactory, tileFactory, itemFactory } = this;
    switch (mapLayout) {
      case 'ROOMS_AND_CORRIDORS': {
        const useNewMapGenerator = true;
        if (useNewMapGenerator) {
          return new RoomCorridorMapGenerator2({
            imageFactory,
            tileFactory,
            itemFactory
          });
        }
        const minRoomDimension = 3;
        const maxRoomDimension = 7;
        return new RoomCorridorMapGenerator({
          minRoomDimension,
          maxRoomDimension,
          imageFactory,
          tileFactory,
          itemFactory
        });
      }
      case 'ROOMS_AND_CORRIDORS_3': {
        return new RoomCorridorMapGenerator3({
          imageFactory,
          tileFactory,
          itemFactory
        });
      }
      case 'BLOB':
        return new BlobMapGenerator({
          imageFactory,
          tileFactory,
          itemFactory
        });
      case 'PATH':
        return new PathMapGenerator({
          imageFactory,
          tileFactory,
          itemFactory
        });
      default:
        throw new Error(`Unknown map layout ${mapLayout}`);
    }
  };

  private _chooseMapStyle = (): MapStyle => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const layout = randChoice([
        //'ROOMS_AND_CORRIDORS',
        'ROOMS_AND_CORRIDORS_3',
        'PATH',
        'BLOB'
      ]);
      const tileSet = randChoice(this.tileFactory.getTileSetNames());
      const chosenStyle = { layout, tileSet };
      if (!this.usedMapStyles.some(style => MapStyle.equals(style, chosenStyle))) {
        this.usedMapStyles.push(chosenStyle);
        return chosenStyle;
      }
    }
  };
}
