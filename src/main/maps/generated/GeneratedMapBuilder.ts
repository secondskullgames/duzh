import Coordinates from '../../geometry/Coordinates';
import { CustomSet } from '../../types/CustomSet';
import ItemFactory from '../../items/ItemFactory';
import MapInstance from '../MapInstance';
import { getUnoccupiedLocations } from '../MapUtils';
import { checkNotNull } from '../../utils/preconditions';
import ImageFactory from '../../graphics/images/ImageFactory';
import { Feature } from '../../utils/features';
import TileSet from '../../tiles/TileSet';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';

type Props = Readonly<{
  width: number;
  height: number;
  tiles: TileType[][];
  tileSet: TileSet;
  imageFactory: ImageFactory;
  tileFactory: TileFactory;
  itemFactory: ItemFactory;
}>;

export default class GeneratedMapBuilder {
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: TileType[][];
  private readonly tileSet: TileSet;
  private readonly entityLocations: CustomSet<Coordinates>;
  private readonly tileFactory: TileFactory;

  constructor(props: Props) {
    this.width = props.width;
    this.height = props.height;
    this.tiles = props.tiles;
    this.entityLocations = new CustomSet();
    this.tileSet = props.tileSet;
    this.tileFactory = props.tileFactory;
  }

  /**
   * TODO: it is really really really questionable that this moves the player unit
   * TODO: Need to put this somewhere else - this is core game logic, don't bury it
   */
  build = async (): Promise<MapInstance> => {
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    const startingCoordinates = checkNotNull(candidateLocations.shift());

    if (Feature.isEnabled(Feature.STAIRS_UP)) {
      this.tiles[startingCoordinates.y][startingCoordinates.x] = 'STAIRS_UP';
    }
    this.entityLocations.add(startingCoordinates);

    const map = new MapInstance({
      width: this.width,
      height: this.height,
      startingCoordinates,
      music: null
    });

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tileFactory.createTile(
          {
            tileType: this.tiles[y][x],
            tileSet: this.tileSet
          },
          { x, y },
          map
        );
        map.addTile(tile);
      }
    }

    return map;
  };
}
