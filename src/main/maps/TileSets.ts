import cave from '../../../data/tilesets/cave.json';
import dungeon from '../../../data/tilesets/dungeon.json';
import Sprite from '../graphics/sprites/Sprite';
import StaticSprite from '../graphics/sprites/StaticSprite';
import type { StaticSpriteConfig } from '../graphics/sprites/StaticSpriteConfig';
import { TileType, TileSet } from '../types/types';

type TilesetJson = {
  name: string,
  tiles: {
    [tileType: string]: (string | null)[]
  }
}

function _getTileSprite(tilesetName: string, filename: string | null): (Sprite | null) {
  if (!filename) {
    return null;
  }

  const spriteConfig: StaticSpriteConfig = {
    name: filename,
    filename: `tiles/${tilesetName}/${filename}`,
    offsets: { dx: 0, dy: 0 }
  };
  return new StaticSprite(spriteConfig);
}

function _buildTileSet(json: TilesetJson): TileSet {
  const tileSet: TileSet = {};
  Object.entries(json.tiles).forEach(([key, filenames]) => {
    const tiles: Sprite[] = [];
    filenames.forEach(filename => {
      const sprite = _getTileSprite(json.name, filename);
      if (sprite) {
        tiles.push(sprite);
      }
    });

    // Wow this is ugly.
    const tileType = TileType[key as keyof typeof TileType];
    tileSet[tileType] = tiles;
  });
  return tileSet;
}

const TileSets = {
  DUNGEON: _buildTileSet(dungeon),
  CAVE: _buildTileSet(cave),
};

export default TileSets;