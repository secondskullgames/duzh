import { TileSetModel } from '../../gen-schema/tile-set.schema';
import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import PaletteSwaps from '../graphics/PaletteSwaps';
import { loadModel } from '../utils/models';
import { TileType } from 'src/gen-schema/tile-type.schema';

type TileSet = Partial<Record<TileType, (Sprite | null)[]>>;

const _fromModel = async (model: TileSetModel): Promise<TileSet> => {
  const tileSet: TileSet = {};
  const promises: Partial<Record<TileType, Promise<Sprite[]>>> = {};

  for (const [tileType, filenames] of Object.entries(model.tiles)) {
    const tilePromises: Promise<Sprite>[] = [];
    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      if (filename) {
        const paletteSwaps = PaletteSwaps.create(model.paletteSwaps ?? {});
        tilePromises.push(SpriteFactory.createTileSprite(`${model.path}/${filename}`, paletteSwaps));
      }
    }
    promises[tileType as TileType] = Promise.all(tilePromises);
  }

  await Promise.all(Object.values(promises));
  for (const [tileType, spritePromises] of Object.entries(promises)) {
    tileSet[tileType as TileType] = await spritePromises;
  }
  return tileSet;
};

namespace TileSet {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`tilesets/${id}`, 'tile-set'));
}

export default TileSet;
