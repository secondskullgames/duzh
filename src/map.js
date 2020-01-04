class GameMap {
  /**
   * @type int
   */
  width;
  /**
   * @type int
   */
  height;
  /**
   * @type Tile[]
   */
  tiles;
  /**
   * @type MapItem[]
   */
  items;
  /**
   * @type Unit[]
   */
  units;
  /**
   * @type Unit
   */
  playerUnit;

  constructor(width, height, tiles, items, units, playerUnit) {
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.items = items;
    this.units = units;
    this.playerUnit = playerUnit;
  }

  /**
   * @returns Tile|null
   */
  getTile(x, y) {
    const tile = this.tiles.filter(t => t.x === x && t.y === y)[0];
    if (!tile) {
      throw `No tile found at ${x}, ${y}`;
    }
    return tile;
  }

  /**
   * @returns {Unit|null}
   */
  getUnit(x, y) {
    return this.units.filter(u => u.x === x && u.y === y)[0] || null;
  }

  /**
   * @returns {MapItem|null}
   */
  getItem(x, y) {
    return this.items.filter(i => i.x === i && i.y === y)[0] || null;
  }

  /**
   * @returns boolean
   */
  contains(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * @returns boolean
   */
  isBlocked(x, y) {
    if (!this.contains(x, y)) {
      throw `(${x}, ${y}) is not on the map`;
    }
    return this.getUnit(x, y) || this.getTile(x, y).isBlocking();
  }
}
