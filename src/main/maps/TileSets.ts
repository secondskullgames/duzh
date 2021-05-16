import Sprite from '../graphics/sprites/Sprite';
import { TileType, TileSet } from '../types/types';
import StaticSprite from '../graphics/sprites/StaticSprite';
import { StaticSpriteConfig } from '../graphics/sprites/StaticSpriteConfig';

type TileFilenames = {
  [tileType in TileType]: (string | null)[]
}

function _getTileSprite(filename: string): Sprite {
  // TODO JSONify these too
  const spriteConfig: StaticSpriteConfig = {
    name: filename,
    filename,
    offsets: { dx: 0, dy: 0 }
  };
  return new StaticSprite(spriteConfig);
}

/**
 * TODO: learn to TypeScript
 */
function _mapFilenames(filenames: TileFilenames): TileSet {
  // @ts-ignore
  const tileSet: TileSet = {};
  Object.entries(filenames).forEach(([tileType, filenames]) => {
    // @ts-ignore
    tileSet[tileType] = [];
    filenames.forEach(filename => {
      const sprite: (Sprite | null) = !!filename ? _getTileSprite(filename) : null;
      // @ts-ignore
      tileSet[tileType].push(sprite);
    });
  });
  return tileSet;
}

const dungeonFilenames: TileFilenames = {
  [TileType.FLOOR]: ['dungeon/tile_floor', 'dungeon/tile_floor_2'],
  [TileType.FLOOR_HALL]: ['dungeon/tile_floor_hall', 'dungeon/tile_floor_hall_2'],
  [TileType.WALL_TOP]: [null],
  [TileType.WALL_HALL]: ['dungeon/tile_wall_hall'],
  [TileType.WALL]: ['dungeon/tile_wall'],
  [TileType.STAIRS_DOWN]: ['stairs_down2'],
  [TileType.NONE]: [null]
};

const caveFilenames: TileFilenames = {
  [TileType.FLOOR]: ['cave/tile_floor', 'cave/tile_floor_2'],
  [TileType.FLOOR_HALL]: ['cave/tile_floor', 'cave/tile_floor_2'],
  [TileType.WALL_TOP]: [],
  [TileType.WALL_HALL]: ['cave/tile_wall'],
  [TileType.WALL]: ['cave/tile_wall'],
  [TileType.STAIRS_DOWN]: ['stairs_down2'],
  [TileType.NONE]: [null]
};

const TileSets = {
  DUNGEON: _mapFilenames(dungeonFilenames),
  CAVE: _mapFilenames(caveFilenames),
};

export default TileSets;