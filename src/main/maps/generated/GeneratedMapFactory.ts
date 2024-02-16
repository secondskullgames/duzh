import AbstractMapGenerator from './AbstractMapGenerator';
import RoomCorridorMapGenerator2 from './room_corridor_rewrite/RoomCorridorMapGenerator2';
import RoomCorridorMapGenerator from './room_corridor/RoomCorridorMapGenerator';
import RoomCorridorMapGenerator3 from './RoomCorridorMapGenerator3';
import BlobMapGenerator from './BlobMapGenerator';
import PathMapGenerator from './PathMapGenerator';
import ModelLoader from '../../utils/ModelLoader';
import MapInstance from '../MapInstance';
import { GameState } from '../../core/GameState';
import { randChoice } from '../../utils/random';
import ItemFactory from '../../items/ItemFactory';
import TileFactory from '../../tiles/TileFactory';
import ImageFactory from '../../graphics/images/ImageFactory';
import { inject, injectable } from 'inversify';

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
export class GeneratedMapFactory {
  private readonly usedMapStyles: MapStyle[] = [];

  constructor(
    @inject(ModelLoader)
    private readonly modelLoader: ModelLoader,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(TileFactory)
    private readonly tileFactory: TileFactory,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(GameState.SYMBOL)
    private readonly state: GameState
  ) {}

  loadMap = async (mapId: string): Promise<MapInstance> => {
    const mapClass = await this.modelLoader.loadGeneratedMapModel(mapId);
    const style = this._chooseMapStyle();
    const dungeonGenerator = this._getDungeonGenerator(style.layout);
    const builder = await dungeonGenerator.generateMap(mapClass, style.tileSet);
    return builder.build(this.state);
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
