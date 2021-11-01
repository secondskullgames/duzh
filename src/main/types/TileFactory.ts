import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { isBlocking } from '../maps/MapUtils';
import { randChoice } from '../utils/random';
import { Tile, TileType } from './types';

type TileSetName = 'dungeon' | 'cave';

type TileSet = {
  [tileType in TileType]?: (Sprite | null)[]
};

type TileSetJson = {
  name: string,
  tiles: {
    [tileType: string]: (string | null)[]
  }
}

const createTileSet = async (tileSetName: TileSetName): Promise<TileSet> => {
  const json = await import(`../../../data/tilesets/${tileSetName}.json`) as TileSetJson;
  const tileSet: TileSet = {};
  for (const [tileType, filenames] of Object.entries(json.tiles)) {
    const tiles: Sprite[] = [];
    for (const filename of filenames) {
      if (filename) {
        const sprite = await SpriteFactory.createStaticSprite(filename);
        tiles.push(sprite);
      }
    }

    tileSet[tileType as TileType] = tiles;
  }
  return tileSet;
};

const createTile = (type: TileType, tileSet: TileSet): Tile => ({
  type,
  sprite: randChoice(tileSet[type]!!),
  isBlocking: isBlocking(type)
});

export type { TileSet, TileSetName };
export default { createTileSet, createTile };
