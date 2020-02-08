{
  const MIN_ROOM_DIMENSION = 7;
  const MAX_ROOM_DIMENSION = 10;
  const MIN_ROOM_PADDING = 3;

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
`, 1),
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
`, 2)
  ];

  /**
   * @param {!int} level
   * @param {!int} width
   * @param {!int} height
   * @param {!int} numEnemies
   * @param {!int} numItems
   */
  function randomMap(level, width, height, numEnemies, numItems) {
    const { UnitFactory, DungeonGenerator } = jwb;
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

    const enemyUnitSupplier = ({ x, y }, level) => {
      const candidates = jwb.UnitClass.getEnemyClasses()
        .filter(unitClass => unitClass.minLevel <= level)
        .filter(unitClass => unitClass.maxLevel >= level);

      const unitClass = RandomUtils.randChoice(candidates);
      return new Unit(unitClass, unitClass.name, level, { x, y });
    };

    return new DungeonGenerator(MIN_ROOM_DIMENSION, MAX_ROOM_DIMENSION, MIN_ROOM_PADDING).generateDungeon(level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier);
  }

  /**
   * @param {string} ascii
   * @param {int} level
   * @private
   */
  function _mapFromAscii(ascii, level) {
    const { UnitClass } = jwb;
    const { Tiles } = jwb.types;
    const lines = ascii.split('\n').filter(line => !line.match(/^ *$/));

    const tiles = [];
    /**
     * @type {?Coordinates}
     */
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
      level,
      width,
      height,
      tiles,
      [], // TODO
      playerUnitLocation,
      enemyUnitLocations,
      ({ x, y }) => new Unit(UnitClass.ENEMY_HUMAN_BLUE, 'enemy_blue', level, { x, y }),
      [],
      () => {
        throw 'unsupported';
      }
    );
  }

  jwb = jwb || {};
  jwb.MapFactory = { randomMap, FIXED_MAPS };
}
