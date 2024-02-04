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
import { GameState } from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import { loadGeneratedMapModel } from '../utils/models';
import { randChoice } from '../utils/random';
import TileFactory from '../tiles/TileFactory';
import { Session } from '../core/Session';
import ItemFactory from '../items/ItemFactory';

type MapStyle = Readonly<{
  tileSet: string;
  layout: string;
}>;

namespace MapStyle {
  export const equals = (first: MapStyle, second: MapStyle) => {
    return first.tileSet === second.tileSet && first.layout === second.layout;
  };
}

type Props = Readonly<{
  imageFactory: ImageFactory;
  tileFactory: TileFactory;
  itemFactory: ItemFactory;
}>;

export default class MapFactory {
  private readonly imageFactory: ImageFactory;
  private readonly tileFactory: TileFactory;
  private readonly itemFactory: ItemFactory;
  private readonly usedMapStyles: MapStyle[] = [];

  constructor({ imageFactory, tileFactory, itemFactory }: Props) {
    this.imageFactory = imageFactory;
    this.tileFactory = tileFactory;
    this.itemFactory = itemFactory;
  }

  loadMap = async (
    mapSpec: MapSpec,
    state: GameState,
    session: Session
  ): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case 'generated': {
        const mapClass = await loadGeneratedMapModel(mapSpec.id);
        const mapBuilder = await this._loadGeneratedMap(mapClass);
        return mapBuilder.build(state, session);
      }
      case 'predefined': {
        return buildPredefinedMap(mapSpec.id, session, state);
      }
    }
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
