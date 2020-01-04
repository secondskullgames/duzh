{
  window.jwb = window.jwb || {};

  const SAMPLE_MAP = (() => {
    const { units } = window.jwb;
    const tiles = _tilesFromAscii(`
#######################
#######################
##...........#.......##
##...........#.......##
##...........#.......##
##...........#.......##
##...................##
##...................##
#######################
#######################
`);
    const width = tiles.map(t => t.x).reduce((a, b) => Math.max(a, b)) + 1;
    const height = tiles.map(t => t.y).reduce((a, b) => Math.max(a, b)) + 1;
    const playerUnit = new Unit(4, 4, 'player', 100);
    const enemyUnit = units.createEnemyUnit(8, 4);

    return new GameMap(
      width,
      height,
      tiles,
      [],
      [playerUnit, enemyUnit],
      playerUnit
    );
  })();

  /**
   * @param {string} ascii
   * @private
   */
  function _tilesFromAscii(ascii) {
    ascii = ascii.trim();
    const tiles = [];
    const lines = ascii.split('\n');
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      for (let x = 0; x < line.length; x++) {
        const c = line[x];
        const tileType = Object.values(window.jwb.tileTypes).filter(t => t.char === c)[0] || null;
        if (!tileType) {
          throw `Unknown tile type ` + c;
        }
        tiles.push(new Tile(x, y, tileType));
      }
    }
    return tiles;
  }

  /**
   * @param {TileType} tileType
   * @param {int} width
   * @param {int} height
   * @return TileType[]
   * @private
   */
  function _tileRect(tileType, width, height) {
    const elements = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        elements.push(new Tile(x, y, tileType));
      }
    }
    return elements;
  }

  window.jwb.maps = { SAMPLE_MAP };
}