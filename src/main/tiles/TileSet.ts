import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import PaletteSwaps from '../graphics/PaletteSwaps';
import { loadTileSetModel } from '../utils/models';
import TileType from '../schemas/TileType';
import TileSetModel from '../schemas/TileSetModel';

type TileSet = Readonly<{
  [key in TileType]?: (Sprite | null)[]
}>;

const _fromModel = async (model: TileSetModel): Promise<TileSet> => {
  const tileSet: {
    [key in TileType]?: (Sprite | null)[]
  } = {};

  for (const [tileType, filenames] of Object.entries(model.tiles)) {
    const tileSprites: Sprite[] = [];
    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      if (filename) {
        const paletteSwaps = PaletteSwaps.create(model.paletteSwaps ?? {});
        const tileSprite = await SpriteFactory.getInstance().createTileSprite(`${model.path}/${filename}`, paletteSwaps);
        tileSprites.push(tileSprite);
      }
    }
    tileSet[tileType as TileType] = tileSprites;
  }

  return tileSet as TileSet;
};

namespace TileSet {
  export const load = async (id: string): Promise<TileSet> => _fromModel(await loadTileSetModel(id));
}

export default TileSet;
