/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
 */
class BSPDungeonGenerator {
  /**
   * Including walls
   * @type int
   */
  minRoomDimension;

  constructor(minRoomDimension) {
    this.minRoomDimension = minRoomDimension;
  }

  /**
   * @param {int} width
   * @param {int} height
   */
  generateDungeon(width, height) {
    const tiles = this._generateTiles(0, 0, width, height);
    return new MapSupplier(width, height, tiles, { x: 0, width: 0 }, [], () => null, [])
  }

  /**
   * @param {int} left
   * @param {int} top
   * @param {int} width
   * @param {int} height
   * @return Tile[]
   * @private
   */
  _generateTiles(left, top, width, height) {
    console.log(`_generateTiles(${left},${top},${width},${height})`);
    // split the area into two sub-dungeons, and recursively generate dungeons within them
    const canSplitHorizontally = (width >= (2 * this.minRoomDimension));
    const canSplitVertically = (height >= (2 * this.minRoomDimension));

    const splitDirections = [
      ...(canSplitHorizontally ? ['HORIZONTAL'] : []),
      ...(canSplitVertically ? ['VERTICAL'] : [])
    ];

    /*
     * MATH IS HARD
     *
     * 3  4  5  6  7  8  9  10 11 12 13 14 15
     * #  #  #  #  #  #  #  #  #  #  #  #  #
     * #                 |                 #
     * #                 |                 #
     * #  #  #  #  #  #  #  #  #  #  #  #  #
     *
     * left: 3
     * right: 16
     * width: 13
     * splitX: 9
     * leftWidth = 6            = splitX - left
     * rightWidth = 7           = right - splitX
     *
     */

    if (splitDirections.length > 0) {
      const direction = splitDirections[this._randInt(0, splitDirections.length - 1)];
      const tiles = [];
      if (direction === 'HORIZONTAL') {
        const splitX = this._getSplitPoint(left, width);
        console.log(`Split(X=${splitX})`);
        const right = left + width;
        const leftWidth = splitX - left;
        const rightWidth = right - splitX;
        const leftTiles = this._generateTiles(left, top, leftWidth, height);
        const rightTiles = this._generateTiles(splitX, top, rightWidth, height);
        tiles.push(...leftTiles, ...rightTiles);
      } else {
        const splitY = this._getSplitPoint(top, height);
        console.log(`Split(Y=${splitY})`);
        const bottom = top + height;
        const topHeight = splitY - top;
        const bottomHeight = bottom - splitY;
        const topTiles = this._generateTiles(left, top, width, topHeight);
        const bottomTiles = this._generateTiles(left, splitY, width, bottomHeight);
        tiles.push(...topTiles, ...bottomTiles);
      }
      return tiles;
    } else {
      return this._generateRoom(left, top, width, height);
    }
  }

  /**
   * @param {int} left
   * @param {int} top
   * @param {int} width
   * @param {int} height
   * @returns {Tile[]}
   * @private
   */
  _generateRoom(left, top, width, height) {
    console.log(`_generateRoom(${left},${top},${width},${height})`);
    const { TileType } = window.jwb.types;
    const tiles = [];
    const [bottom, right] = [top + height, left + width]; // exclusive
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        if (x === left || x === (right - 1) || y === top || y === (bottom - 1)) {
          tiles.push(new Tile(x, y, TileType.WALL));
        } else {
          tiles.push(new Tile(x, y, TileType.FLOOR));
        }
      }
    }
    return tiles;
  }

  /**
   * @param {int} min left or top
   * @param {int} dimension width or height
   * @returns {int} the min X/Y coordinate of the *second* room
   * @private
   */
  _getSplitPoint(min, dimension) {
    const minSplitPoint = min + this.minRoomDimension;
    const maxSplitPoint = (min + dimension) - this.minRoomDimension;
    return this._randInt(minSplitPoint, maxSplitPoint);
  }

  /**
   * @param {int} min
   * @param {int} max inclusive
   * @private
   */
  _randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}