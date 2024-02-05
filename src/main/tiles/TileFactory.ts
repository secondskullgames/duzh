import TileSet from './TileSet';
import Tile from './Tile';
import TileType from '../schemas/TileType';
import Sprite from '../graphics/sprites/Sprite';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import { randChoice } from '../utils/random';
import { loadTileSetModel } from '../utils/models';
import { Feature } from '../utils/features';
import MapInstance from '../maps/MapInstance';
import { injectable } from 'inversify';

type CreateTileParams = Readonly<{
  tileType: TileType;
  tileSet: TileSet;
}>;

@injectable()
export default class TileFactory {
  constructor(private readonly spriteFactory: SpriteFactory) {}

  createTile = (
    { tileType, tileSet }: CreateTileParams,
    coordinates: Coordinates,
    map: MapInstance
  ): Tile => {
    const tilesOfType = checkNotNull(tileSet[tileType]);
    const sprite = randChoice(tilesOfType);
    return new Tile({ tileType, sprite, coordinates, map });
  };

  getTileSet = async (id: string): Promise<TileSet> => {
    const model = await loadTileSetModel(id);
    const tileSet: {
      [key in TileType]?: (Sprite | null)[];
    } = {};

    for (const [tileType, filenames] of Object.entries(model.tiles)) {
      const tileSprites: Sprite[] = [];
      for (let index = 0; index < filenames.length; index++) {
        const filename = filenames[index];
        if (filename) {
          const paletteSwaps = PaletteSwaps.create(model.paletteSwaps ?? {});
          const tileSprite = await this.spriteFactory.createTileSprite(
            `${model.path}/${filename}`,
            paletteSwaps
          );
          tileSprites.push(tileSprite);
        }
      }
      tileSet[tileType as TileType] = tileSprites;
    }

    return tileSet as TileSet;
  };

  /**
   * TODO hardcoding these
   */
  getTileSetNames = (): string[] => {
    if (Feature.isEnabled(Feature.DARK_DUNGEON)) {
      return ['dark/dungeon_dark1', 'dark/dungeon_dark2', 'dark/dungeon_dark3'];
    }

    return [
      'catacomb',
      'catacomb_gold',
      'catacomb_red',
      'cave',
      'cave_blue',
      'dungeon',
      'dungeon_brown',
      'dungeon_cga',
      'dungeon_cga_alt',
      'dungeon_green',
      'kroz',
      'kroz_teal',
      'kroz_green',
      'kroz_yellow',
      'zzt',
      'zzt_alt'
    ];
  };
}
