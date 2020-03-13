import UnitClasses from '../units/UnitClasses';
import Unit from '../units/Unit';
import MapSupplier from './MapSupplier';
import Tiles from '../types/Tiles';
import { Coordinates, Tile } from '../types/types';

const FIXED_MAPS = [
  () => _mapFromAscii(`
              ###########
              #.........#
              #....U....#               
              #.....................
              #.........#          .
              ###.#######          .
                 .                 .
#############      .                 .
#...........#      .           ######.#####
#...........#      .           #..........#
#....@......#      .           #...U....>.#
#...................           #..........#
#...........#                  #.....U....#
#......U....#                  ############
#############
`, 1),
  () => _mapFromAscii(`
###########################################
#.........................................#
#...............U............U............#
#.........................................#
#...........####################......U...#
#...........#                  #..........#
#...@.......#                  #..........#
#...........#                  #..........#
#...........#                  ############
#############
`, 2)
];

function _mapFromAscii(ascii: string, level: number): MapSupplier {
  const lines = ascii.split('\n').filter(line => !line.match(/^ *$/));

  const tiles: Tile[][] = [];
  let playerUnitLocation: (Coordinates | null) = null;
  const enemyUnitLocations: Coordinates[] = [];
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const c = line[x];
      let tile = Object.values(Tiles).filter(t => t.char === c)[0] || null;
      if (!tile) {
        if (c === '@') {
          playerUnitLocation = { x, y };
          tile = Tiles.FLOOR;
        } else if (c === 'U') {
          enemyUnitLocations.push({ x, y });
          tile = Tiles.FLOOR;
        } else {
          tile = Tiles.NONE;
        }
      }
      tiles[y] = tiles[y] || [];
      tiles[y][x] = tile;
    }
  }

  const width = tiles.map(row => row.length).reduce((a, b) => Math.max(a, b)) + 1;
  const height = tiles.length;

  if (!playerUnitLocation) {
    throw 'No player unit location';
  }

  return {
    level,
    width,
    height,
    tiles,
    rooms: [], // TODO
    playerUnitLocation,
    enemyUnitLocations,
    enemyUnitSupplier: ({ x, y }) => new Unit(UnitClasses.ENEMY_GRUNT, 'enemy_grunt', level, { x, y }),
    itemLocations: [],
    itemSupplier: () => {
      throw 'unsupported';
    }
  };
}

export default FIXED_MAPS;