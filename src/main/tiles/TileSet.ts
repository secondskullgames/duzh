import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import PaletteSwaps from '../graphics/PaletteSwaps';
import TileType from './TileType';

type TileSetName = 'dungeon' | 'cave';
const names: TileSetName[] = ['dungeon', 'cave'];

type TileSet = Partial<Record<TileType, (Sprite | null)[]>>;

type TileSetModel = {
  path: string,
  tiles: Record<TileType, (string | null)[]>,
  paletteSwaps?: Record<string, string>
};

const _memos: Record<string, TileSet> = {};

const _loadTileSet = async (name: TileSetName): Promise<TileSet> => {
  const json = await import(
    /* webpackMode: "eager" */
    `../../../data/tilesets/${name}.json`
  ) as TileSetModel;
  const tileSet: TileSet = {};
  const promises: Partial<Record<TileType, Promise<Sprite[]>>> = {};

  for (const [tileType, filenames] of Object.entries(json.tiles)) {
    const tilePromises: Promise<Sprite>[] = [];
    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      if (filename) {
        const paletteSwaps = PaletteSwaps.create(json.paletteSwaps || {});
        tilePromises.push(SpriteFactory.createTileSprite(`${json.path}/${filename}`, paletteSwaps));
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
  export const forName = async (name: TileSetName): Promise<TileSet> => {
    if (!_memos[name]) {
      _memos[name] = await _loadTileSet(name);
    }

    return _memos[name];
  };

  export const preload = async () =>
    Promise.all(names.map(TileSet.forName));
}

export default TileSet;
export { TileSetName };
