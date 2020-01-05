{
  window.jwb = window.jwb || {};

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
   */
  function randomMap(width, height) {
    return new BSPDungeonGenerator(4, 4).generateDungeon(width, height);
  }

  /**
   * @param {string} ascii
   * @private
   */
  function _mapFromAscii(ascii) {
    const { TileType } = window.jwb.types;
    const lines = ascii.split('\n').filter(line => !line.match(/^ *$/));

    const tiles = [];
    let playerUnitLocation = null;
    const enemyUnitLocations = [];
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      for (let x = 0; x < line.length; x++) {
        const c = line[x];
        let tileType = Object.values(TileType).filter(t => t.char === c)[0] || null;
        if (!tileType) {
          if (c === '@') {
            playerUnitLocation = { x, y };
            tileType = TileType.FLOOR;
          } else if (c === 'U') {
            enemyUnitLocations.push({ x, y });
            tileType = TileType.FLOOR;
          } else {
            tileType = TileType.NONE;
          }
        }
        tiles.push(new Tile(x, y, tileType));
      }
    }
    const width = tiles.map(t => t.x).reduce((a, b) => Math.max(a, b)) + 1;
    const height = tiles.map(t => t.y).reduce((a, b) => Math.max(a, b)) + 1;

    /**
     * @type {Function<Coordinates, Unit>}
     */
    const enemyUnitSupplier = ({ x, y }) => {
      const u = new Unit(x, y, 'enemy', 50);
      u.update = () => tryMoveRandomly(u);
      return u;
    };

    return new MapSupplier(
      width,
      height,
      tiles,
      playerUnitLocation,
      enemyUnitLocations,
      enemyUnitSupplier,
      []
    );
  }

  window.jwb.MapFactory = { randomMap, FIXED_MAPS };
}