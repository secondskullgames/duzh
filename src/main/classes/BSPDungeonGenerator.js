/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
 */
//Math.random = () => 0.5;

class BSPDungeonGenerator {
  /**
   * @type int
   */
  minSectionDimension;
  /**
   * Including walls
   * @type int
   */
  minRoomDimension;

  constructor(minSectionDimension, minRoomDimension) {
    this.minSectionDimension = minSectionDimension;
    this.minRoomDimension = minRoomDimension;
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
        this._joinSectionsVertically(tiles, topHeight);
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

  /** TODO this does not account for the case where there's no straight line between the two rooms.
   * Deal with this with multi-part paths in the future.
   */
  _joinSectionsHorizontally(tiles, splitX) {
    const { Tiles } = window.jwb.types;
    const leftSection = tiles
      .map(row => row.slice(0, splitX))
      .map(row => row.map(tile => tile.char));
    const rightSection = tiles
      .map(row => row.slice(splitX, row.length))
      .map(row => row.map(tile => tile.char));

    console.log('_joinSectionsHorizontally:');
    console.log(leftSection.map(row => row.join('')).join('\n'));
    console.log(rightSection.map(row => row.join('')).join('\n'));

    const leftRoomRightWall = leftSection
      .map(row => row.lastIndexOf(Tiles.WALL.char))
      .reduce((a, b) => Math.max(a, b));
    const leftRoomTopWall = leftSection
      .findIndex(row => row.lastIndexOf(Tiles.WALL.char) === leftRoomRightWall);
    const leftRoomBottomWall = leftSection
      .map((row, i) => ((row.lastIndexOf(Tiles.WALL.char) === leftRoomRightWall) ? i : -1))
      .reduce((a, b) => Math.max(a, b));

    const rightRoomLeftWall = splitX + rightSection
      .map(row => row.indexOf(Tiles.WALL.char))
      .filter(x => x > -1)
      .reduce((a, b) => Math.min(a, b));
    const rightRoomTopWall = rightSection
      .findIndex(row => row.indexOf(Tiles.WALL.char) === (rightRoomLeftWall - splitX));
    const rightRoomBottomWall = rightSection
      .map((row, i) => ((row.indexOf(Tiles.WALL.char) === (rightRoomLeftWall - splitX)) ? i : -1))
      .reduce((a, b) => Math.max(a, b));

    const yCandidates = leftSection
      .map((leftRow, i) => {
        if (leftRow.indexOf(Tiles.WALL.char) > -1) {
          const leftRowRightWall = leftRow.lastIndexOf(Tiles.WALL.char);
          if (leftRow[leftRowRightWall - 1] !== Tiles.WALL.char) {
            const rightRow = rightSection[i];
            const rightRowLeftWall = rightRow.indexOf(Tiles.WALL.char);
            if (rightRowLeftWall > -1 && (rightRow[rightRowLeftWall + 1] !== Tiles.WALL.char)) {
              return i;
            }
          }
        }
        return -1;
      })
      .filter(i => i !== -1 && i > leftRoomTopWall && i < leftRoomBottomWall);

    const y = yCandidates[this._randInt(0, yCandidates.length - 1)];
    if (!y) {
      debugger;
    }

    const leftRowRightWall = leftSection[y].lastIndexOf(Tiles.WALL.char);
    const rightRowLeftWall = rightSection[y].indexOf(Tiles.WALL.char) + splitX;
    for (let x = leftRowRightWall; x <= rightRowLeftWall; x++) {
      tiles[y] = tiles[y] || []; // TODO
      tiles[y][x] = Tiles.FLOOR;
      console.log(`X  Corridor: ${x} ${y}`);
    }
  }

  _joinSectionsVertically(tiles, splitY) {
    const { Tiles } = window.jwb.types;
    const topSection = tiles
      .filter((row, i) => i < splitY)
      .map(row => row.map(tile => tile.char));
    const bottomSection = tiles
      .filter((row, i) => i < splitY)
      .map(row => row.map(tile => tile.char));

    const topRoomBottomWall = topSection
      .filter(row => row.indexOf(Tiles.WALL.char) > -1)
      .map((row, i) => i)
      .reduce((a, b) => Math.max(a, b));
    const topRoomLeftWall = topSection[topRoomBottomWall].indexOf(Tiles.WALL.char);
    const topRoomRightWall = topSection[topRoomBottomWall].lastIndexOf(Tiles.WALL.char);

    const bottomRoomTopWall = splitY + bottomSection
      .findIndex(row => row.indexOf(Tiles.WALL.char) > -1);
    const bottomRoomLeftWall = bottomSection[bottomRoomTopWall - splitY].indexOf(Tiles.WALL.char);
    const bottomRoomRightWall = bottomSection[bottomRoomTopWall - splitY].lastIndexOf(Tiles.WALL.char);

    // TODO this does not account for the case where there's no straight line between the two rooms.
    // Deal with this with multi-part paths in the future.
    const x = this._randInt(
      Math.max(topRoomLeftWall + 1, bottomRoomLeftWall + 1),
      Math.min(topRoomRightWall - 1, bottomRoomRightWall - 1)
    );

    for (let y = topRoomBottomWall; y <= bottomRoomTopWall; y++) {
      tiles[y][x] = Tiles.FLOOR;
      console.log(`Y Corridor: ${x} ${y}`);
    }
  }
}