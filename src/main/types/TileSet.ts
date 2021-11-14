import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import TileType from './TileType';

type TileSetName = 'dungeon' | 'cave';

type TileSet = Partial<Record<TileType, (Sprite | null)[]>>;

type TileSetJson = {
  name: string,
  tiles: {
    [tileType: string]: (string | null)[]
  }
}

const _memos: Record<string, TileSet> = {};

const _loadTileSet = async (name: TileSetName): Promise<TileSet> => {
  const json = await import(`../../../data/tilesets/${name}.json`) as TileSetJson;
  const tileSet: TileSet = {};
  for (const [tileType, filenames] of Object.entries(json.tiles)) {
    const tiles: Sprite[] = [];
    for (const filename of filenames) {
      if (filename) {
        const sprite = await SpriteFactory.createTileSprite(`${name}/${filename}`);
        tiles.push(sprite);
      }
    }

    tileSet[tileType as TileType] = tiles;
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
}

export default TileSet;
export { TileSetName };
