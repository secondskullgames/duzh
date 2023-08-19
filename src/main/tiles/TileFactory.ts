import TileType from '../schemas/TileType';
import Sprite from '../graphics/sprites/Sprite';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import TileSet from './TileSet';
import Coordinates from '../geometry/Coordinates';
import Tile from './Tile';
import { checkNotNull } from '../utils/preconditions';
import { randChoice } from '../utils/random';
import { loadTileSetModel } from '../utils/models';

type CreateTileContext = Readonly<{
  tileType: TileType,
  tileSet: TileSet,
  coordinates: Coordinates
}>;

const createTile = (
  { tileType, tileSet, coordinates }: CreateTileContext
): Tile => {
  const tilesOfType = checkNotNull(tileSet[tileType]);
  const sprite = randChoice(tilesOfType);
  return new Tile({tileType, sprite, coordinates});
};

type GetTileSetContext = Readonly<{
  spriteFactory: SpriteFactory
}>;

const getTileSet = async (
  id: string,
  { spriteFactory }: GetTileSetContext
): Promise<TileSet> => {
  const model = await loadTileSetModel(id);
  const tileSet: {
    [key in TileType]?: (Sprite | null)[]
  } = {};

  for (const [tileType, filenames] of Object.entries(model.tiles)) {
    const tileSprites: Sprite[] = [];
    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      if (filename) {
        const paletteSwaps = PaletteSwaps.create(model.paletteSwaps ?? {});
        const tileSprite = await spriteFactory.createTileSprite(
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
const getTileSetNames = (): string[] => {
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

export default {
  getTileSet,
  createTile,
  getTileSetNames
}