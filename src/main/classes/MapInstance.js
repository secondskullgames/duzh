class MapInstance {
  /**
   * @type int
   */
  width;
  /**
   * @type int
   */
  height;
  /**
   * [y][x]
   * @type Tile[][]
   */
  tiles;
  /**
   * @type Unit[]
   */
  units;
  /**
   * @type MapItem[]
   */
  items;

  constructor(width, height, tiles, units, items) {
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.units = units;
    this.items = items;
  }

  /**
   * @returns Tile
   */
  getTile(x, y) {
    const { Tiles } = window.jwb.types;
    return (this.tiles[y] || [])[x] || Tiles.NONE;
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
    return this.items.filter(i => i.x === x && i.y === y)[0] || null;
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
    return this.getUnit(x, y) || this.getTile(x, y).isBlocking;
  }

  removeItem({ x, y }) {
    const index = this.items.findIndex(i => (i.x === x && i.y === y));
    this.items.splice(index, 1);
  }
}
