import Sprite from '../graphics/sprites/Sprite';
import ImageSupplier from '../graphics/ImageSupplier';
import Colors from '../types/Colors';
import { PaletteSwaps, TileType, TileSet } from '../types/types';
import { createStaticSprite } from '../graphics/sprites/SpriteFactory';

type TileFilenames = {
  [tileType in TileType]: (string | null)[]
}

type SpriteSupplier = (paletteSwaps: PaletteSwaps) => Sprite;

function _getTileSprite(filename: string): SpriteSupplier {
  return (paletteSwaps: PaletteSwaps) => createStaticSprite(new ImageSupplier(filename, Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 });
}

function _mapFilenames(filenames: TileFilenames): TileSet {
  // @ts-ignore
  const tileSet: TileSet = {};
  Object.entries(filenames).forEach(([tileType, filenames]) => {
    // @ts-ignore
    tileSet[tileType] = [];
    filenames.forEach(filename => {
      const sprite: (Sprite | null) = !!filename ? _getTileSprite(filename)({}) : null;
      // @ts-ignore
      tileSet[tileType].push(sprite);
    });
  });
  return tileSet;
}

const dungeonFilenames: TileFilenames = {
  [TileType.FLOOR]: ['dungeon/tile_floor', 'dungeon/tile_floor_2'],
  [TileType.FLOOR_HALL]: ['dungeon/tile_floor_hall', 'dungeon/tile_floor_hall_2'],
  [TileType.WALL_TOP]: ['dungeon/tile_wall'],
  [TileType.WALL_HALL]: ['dungeon/tile_wall_hall'],
  [TileType.WALL]: [null],
  [TileType.STAIRS_DOWN]: ['stairs_down2'],
  [TileType.NONE]: [null]
};

const caveFilenames: TileFilenames = {
  [TileType.FLOOR]: ['cave/tile_floor', 'cave/tile_floor_2'],
  [TileType.FLOOR_HALL]: ['cave/tile_floor', 'cave/tile_floor_2'],
  [TileType.WALL_TOP]: ['cave/tile_wall'],
  [TileType.WALL_HALL]: ['cave/tile_wall'],
  [TileType.WALL]: [null],
  [TileType.STAIRS_DOWN]: ['stairs_down2'],
  [TileType.NONE]: [null]
};

const TileSets = {
  DUNGEON: _mapFilenames(dungeonFilenames),
  CAVE: _mapFilenames(caveFilenames),
};

export default TileSets;