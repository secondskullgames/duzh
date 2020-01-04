class Tile {
  x;
  y;
  /**
   * @type TileType
   */
  type;

  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  isBlocking() {
    return this.type.isBlocking;
  }
}