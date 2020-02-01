{
  const MIN_ROOM_DIMENSION = 6;
  const MAX_ROOM_DIMENSION = 12;
  const MIN_ROOM_PADDING = 1;

  const FIXED_MAPS = [
    _mapFromAscii(`
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
`),
    _mapFromAscii(`
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
`)
  ];

  /**
   * @param {int} width
   * @param {int} height
   * @param {int} numEnemies
   * @param {int} numItems
   */
  function randomMap(width, height, numEnemies, numItems) {
    const { UnitFactory, DungeonGenerator2 } = jwb;
    const { RandomUtils } = jwb.utils;

    const itemSupplier = ({ x, y }) => {
      switch (RandomUtils.randInt(0, 3)) {
        case 0:
          return new MapItem(
            x,
            y,
            'S',
            jwb.SpriteFactory.MAP_SWORD(),
            () => jwb.ItemFactory.createSword(6)
          );
        default:
          return new MapItem(
            x,
            y,
            'P',
            jwb.SpriteFactory.MAP_POTION(),
            () => jwb.ItemFactory.createPotion(50)
          );
      }
    };

    const enemyUnitSupplier = ({ x, y }) => {
      return RandomUtils.randChoice([UnitFactory.ENEMY_BLUE, UnitFactory.ENEMY_RED])
        .call(null, { x, y });
    };

    return new DungeonGenerator2(MIN_ROOM_DIMENSION, MAX_ROOM_DIMENSION, MIN_ROOM_PADDING).generateDungeon(width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier);
  }

  /**
   * @param {string} ascii
   * @private
   */
  function _mapFromAscii(ascii) {
    const { UnitFactory } = jwb;
    const { Tiles } = jwb.types;
    const lines = ascii.split('\n').filter(line => !line.match(/^ *$/));

    const tiles = [];
    let playerUnitLocation = null;
    const enemyUnitLocations = [];
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

    return new MapSupplier(
      width,
      height,
      tiles,
      playerUnitLocation,
      enemyUnitLocations,
      ({ x, y }) => UnitFactory.ENEMY({ x, y }),
      []
    );
  }

  jwb = jwb || {};
  jwb.MapFactory = { randomMap, FIXED_MAPS };
}
