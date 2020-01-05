/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
 */
class BSPDungeonGenerator {
  /**
   * @type int
   */
  minSectionDimension;
  /**
   * Including walls
   * @type int
   */
  minRoomDimension = 6;

  constructor(minRoomDimension) {
    this.minSectionDimension = minRoomDimension;
  }

  /**
   * @param {int} width
   * @param {int} height
   */
  generateDungeon(width, height) {
    const tiles = this._generateTiles(width, height);
    return new MapSupplier(width, height, tiles, { x: 0, y: 0 }, [], () => null, [])
  }

  /**
   * @param {int} width
   * @param {int} height
   * @return Tile[]
   * @private
   */
  _generateTiles(width, height) {
    console.log(`_generateTiles(${width},${height})`);
    // split the area into two sub-dungeons, and recursively generate dungeons within them
    const canSplitHorizontally = (width >= (2 * this.minSectionDimension));
    const canSplitVertically = (height >= (2 * this.minSectionDimension));

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
     */
    if (splitDirections.length > 0) {
      const direction = splitDirections[this._randInt(0, splitDirections.length - 1)];
      if (direction === 'HORIZONTAL') {
        const splitX = this._getSplitPoint(width);
        console.log(`SplitX(${width} => ${splitX})`);
        const leftWidth = splitX;
        const rightWidth = width - splitX;
        const leftTiles = this._generateTiles(leftWidth, height);
        const rightTiles = this._generateTiles(rightWidth, height);
        const tiles = [];
        for (let y = 0; y < leftTiles.length; y++) {
          tiles[y] = [...leftTiles[y], ...rightTiles[y]];
        }
        return tiles;
      } else {
        const splitY = this._getSplitPoint(height);
        console.log(`SplitY(${height} => ${splitY})`);
        const topHeight = splitY;
        const bottomHeight = height - splitY;
        const topTiles = this._generateTiles(width, topHeight);
        const bottomTiles = this._generateTiles(width, bottomHeight);
        return [...topTiles, ...bottomTiles];
      }
    } else {
      return this._generateSection(width, height);
    }
  }

  /**
   * @param {int} width
   * @param {int} height
   * @returns {Tile[]}
   * @private
   */
  _generateSection(width, height) {
    console.log(`_generateSection(${width},${height})`);
    const { Tiles } = window.jwb.types;
    const roomWidth = this._randInt(this.minRoomDimension, width);
    const roomHeight = this._randInt(this.minRoomDimension, height);
    const room = this._generateRoom(roomWidth, roomHeight);

    const roomLeft = this._randInt(0, width - roomWidth);
    const roomTop = this._randInt(0, height - roomHeight);
    const tiles = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      const roomY = y - roomTop;
      for (let x = 0; x < width; x++) {
        const roomX = x - roomLeft;
        if (roomX >= 0 && roomX < room[0].length && roomY >= 0 && roomY < room.length) {
          tiles[y][x] = room[roomY][roomX];
        } else {
          tiles[y][x] = Tiles.NONE;
        }
      }
    }

    return tiles;
  }


  /**
   * @param {int} width
   * @param {int} height
   * @returns {Tile[]}
   * @private
   */
  _generateRoom(width, height) {
    console.log(`_generateRoom(${width},${height})`);
    const { Tiles } = window.jwb.types;
    const tiles = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
          tiles[y][x] = Tiles.WALL;
        } else {
          tiles[y][x] = Tiles.FLOOR;
        }
      }
    }
    return tiles;
  }

  /**
   * @param {int} dimension width or height
   * @returns {int} the min X/Y coordinate of the *second* room
   * @private
   */
  _getSplitPoint(dimension) {
    const minSplitPoint = this.minSectionDimension;
    const maxSplitPoint = dimension - this.minSectionDimension;
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