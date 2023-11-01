import BlobMapGenerator from './generated/BlobMapGenerator';
import AbstractMapGenerator from './generated/AbstractMapGenerator';
import RoomCorridorMapGenerator from './generated/room_corridor/RoomCorridorMapGenerator';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import RoomCorridorMapGenerator2 from './generated/room_corridor_rewrite/RoomCorridorMapGenerator2';
import PathMapGenerator from './generated/PathMapGenerator';
import RoomCorridorMapGenerator3 from './generated/RoomCorridorMapGenerator3';
import MapInstance from './MapInstance';
import { buildPredefinedMap } from './predefined/buildPredefinedMap';
import MapSpec from '../schemas/MapSpec';
import GeneratedMapModel from '../schemas/GeneratedMapModel';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import { loadGeneratedMapModel } from '../utils/models';
import { randChoice } from '../utils/random';
import TileFactory from '../tiles/TileFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
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
  private readonly usedMapStyles: MapStyle[] = [];

  loadMap = async (mapSpec: MapSpec, { state, imageFactory }: Context): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case 'generated': {
        const mapClass = await loadGeneratedMapModel(mapSpec.id);
        const mapBuilder = await this._loadGeneratedMap(mapClass, { state, imageFactory });
        return mapBuilder.build({ state, imageFactory });
      }
      case 'predefined': {
        return this._loadPredefinedMap(mapSpec.id, { state, imageFactory });
      }
    }
  };

  private _loadGeneratedMap = async (mapClass: GeneratedMapModel, { imageFactory }: Context): Promise<GeneratedMapBuilder> => {
    const style = this._chooseMapStyle();
    const dungeonGenerator = this._getDungeonGenerator(style.layout);
    return dungeonGenerator.generateMap(mapClass, style.tileSet, { imageFactory });
  };

  private _loadPredefinedMap = async (mapId: string, { state, imageFactory }: Context): Promise<MapInstance> => {
    return buildPredefinedMap(mapId, { state, imageFactory });
  };

  private _getDungeonGenerator = (mapLayout: string): AbstractMapGenerator => {
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
  }

  private _chooseMapStyle = (): MapStyle => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const layout = randChoice([
        //'ROOMS_AND_CORRIDORS',
        'ROOMS_AND_CORRIDORS_3',
        'PATH',
        'BLOB',
      ])
      const tileSet = randChoice(TileFactory.getTileSetNames());
      const chosenStyle = { layout, tileSet };
      if (!this.usedMapStyles.some(style => MapStyle.equals(style, chosenStyle))) {
        this.usedMapStyles.push(chosenStyle);
        return chosenStyle;
      }
    }
  }
}
