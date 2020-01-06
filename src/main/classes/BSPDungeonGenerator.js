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
  minRoomDimension = 4;

  constructor(minSectionDimension) {
    this.minSectionDimension = minSectionDimension;
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
   * @return Tile[][]
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
        this._joinSectionsHorizontally(tiles, leftWidth);
        return tiles;
      } else {
        const splitY = this._getSplitPoint(height);
        console.log(`SplitY(${height} => ${splitY})`);
        const topHeight = splitY;
        const bottomHeight = height - splitY;
        const topTiles = this._generateTiles(width, topHeight);
        const bottomTiles = this._generateTiles(width, bottomHeight);
        const tiles =  [...topTiles, ...bottomTiles];
        this._joinSectionsVertically(tiles, topHeight + 1);
        return tiles;
      }
    } else {
      return this._generateSection(width, height);
    }
  }

  /**
   * @param {int} width
   * @param {int} height
   * @return {Tile[][]} A rectangular section of tiles, consisting of a room surrounded by empty spaces
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
   * @return {Tile[][]}
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

  _joinSectionsHorizontally(tiles, splitX) {
    const { Tiles } = window.jwb.types;
    const leftRoom = tiles
      .map(row => row.slice(0, splitX))
      .map(row => row.map(tile => tile.char));
    const rightRoom = tiles
      .map(row => row.slice(splitX, row.length))
      .map(row => row.map(tile => tile.char));

    const leftRoomRightWall = leftRoom
      .map(row => row.lastIndexOf(Tiles.WALL.char))
      .reduce((a, b) => Math.max(a, b));
    const leftRoomTopWall = leftRoom
      .findIndex(row => row.lastIndexOf(Tiles.WALL.char) === leftRoomRightWall);
    const leftRoomBottomWall = leftRoom
      .map((row, i) => ((row.lastIndexOf(Tiles.WALL.char) === leftRoomRightWall) ? i : -1))
      .reduce((a, b) => Math.max(a, b));

    const rightRoomLeftWall = splitX + rightRoom
      .map(row => row.indexOf(Tiles.WALL.char))
      .filter(x => x > -1)
      .reduce((a, b) => Math.min(a, b));
    const rightRoomTopWall = rightRoom
      .findIndex(row => row.indexOf(Tiles.WALL.char) === (rightRoomLeftWall - splitX));
    const rightRoomBottomWall = rightRoom
      .map((row, i) => ((row.indexOf(Tiles.WALL.char) === (rightRoomLeftWall - splitX)) ? i : -1))
      .reduce((a, b) => Math.max(a, b));

    // TODO this does not account for the case where there's no straight line between the two rooms.
    // Deal with this with multi-part paths in the future.
    const y = this._randInt(
      Math.max(leftRoomTopWall + 1, rightRoomTopWall + 1),
      Math.min(leftRoomBottomWall - 1, rightRoomBottomWall - 1)
    );

    for (let x = leftRoomRightWall; x <= rightRoomLeftWall; x++) {
      tiles[y] = tiles[y] || []; // TODO
      tiles[y][x] = Tiles.FLOOR;
      console.log(`corridor: (${x}, ${y}), splitX=${splitX}, ${leftRoomRightWall}, ${rightRoomLeftWall}, ${leftRoomTopWall}, ${rightRoomTopWall}`);
      console.log(leftRoom.map(row => row.join('')).join('\n'));
      console.log(rightRoom.map(row => row.join('')).join('\n'));
    }
  }

  _joinSectionsVertically(tiles, splitY) {
    const { Tiles } = window.jwb.types;
    const topRoom = tiles.filter((row, i) => i < splitY);
    const bottomRoom = tiles.filter((row, i) => i < splitY);
  }
}