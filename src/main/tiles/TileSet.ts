import { TileSetModel } from '../../gen-schema/tile-set.schema';
import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import PaletteSwaps from '../graphics/PaletteSwaps';
import { loadModel } from '../utils/models';
import { TileType } from 'src/gen-schema/tile-type.schema';

type TileSet = Partial<Record<TileType, (Sprite | null)[]>>;

const _fromModel = async (model: TileSetModel): Promise<TileSet> => {
  const tileSet: TileSet = {};

  for (const [tileType, filenames] of Object.entries(model.tiles)) {
    const tileSprites: Sprite[] = [];
    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      if (filename) {
        const paletteSwaps = PaletteSwaps.create(model.paletteSwaps ?? {});
        const tileSprite = await SpriteFactory.createTileSprite(`${model.path}/${filename}`, paletteSwaps);
        tileSprites.push(tileSprite);
      }
    }
    tileSet[tileType as TileType] = tileSprites;
  }

  return tileSet;
};

namespace TileSet {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`tilesets/${id}`, 'tile-set'));
}

export default TileSet;
