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
   * @param {int} numEnemies
   * @param {Function<Coordinates, Unit>} enemyUnitSupplier
   */
  generateDungeon(width, height, numEnemies, enemyUnitSupplier) {
    const tiles = this._generateTiles(width, height);
    const enemyLocations = this._pickNLocations(tiles, numEnemies);
    const playerLocation = this._getPlayerLocation(tiles, enemyLocations);
    return new MapSupplier(width, height, tiles, playerLocation, enemyLocations, enemyUnitSupplier, [])
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

    const yCandidates = leftSection
      .map((leftRow, y) => {
        if (leftRow.indexOf(Tiles.WALL.char) > -1) {
          const leftRowRightWall = leftRow.lastIndexOf(Tiles.WALL.char);
          if (leftRow[leftRowRightWall - 1] !== Tiles.WALL.char) {
            const rightRow = rightSection[y];
            const rightRowLeftWall = rightRow.indexOf(Tiles.WALL.char);
            if (rightRowLeftWall > -1 && (rightRow[rightRowLeftWall + 1] !== Tiles.WALL.char)) {
              return y;
            }
          }
        }
        return -1;
      })
      .filter(i => i !== -1);

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

  /**
   * TODO this does not account for the case where there's no straight line between the two rooms.
   */
  _joinSectionsVertically(tiles, splitY) {
    const { Tiles } = window.jwb.types;
    /**
     * @type string[][]
     */
    const topSection = tiles
      .filter((row, i) => i < splitY)
      .map(row => row.map(tile => tile.char));
    /**
     * @type string[][]
     */
    const bottomSection = tiles
      .filter((row, i) => i >= splitY)
      .map(row => row.map(tile => tile.char));

    console.log(topSection.map(row => row.join('')).join('\n'));
    console.log(bottomSection.map(row => row.join('')).join('\n'));

    const topCols = topSection[0].map((_, x) => topSection.map(row => row[x]));
    const bottomCols = bottomSection[0].map((_, x) => bottomSection.map(row => row[x]));

    const xCandidates = topCols
      .map((topCol, x) => {
        if (topCol.indexOf(Tiles.WALL.char) > -1) {
          const topColBottomWall = topCol.lastIndexOf(Tiles.WALL.char);
          if (topCol[topColBottomWall - 1] !== Tiles.WALL.char) {
            const bottomCol = bottomCols[x];
            const bottomColTopWall = bottomCol.indexOf(Tiles.WALL.char);
            if ((bottomColTopWall > -1) && (bottomColTopWall < (bottomCol.length - 1)) && (bottomCol[bottomColTopWall + 1] !== Tiles.WALL.char)) {
              return x;
            }
          }
        }
        return -1;
      })
      .filter(i => i !== -1);

    const x = xCandidates[this._randInt(0, xCandidates.length - 1)];
    if (!x) {
      debugger;
    }

    const topColBottomWall = topSection.map(row => row[x]).lastIndexOf(Tiles.WALL.char);
    const bottomColTopWall = bottomSection.map(row => row[x]).indexOf(Tiles.WALL.char) + splitY;
    for (let y = topColBottomWall; y <= bottomColTopWall; y++) {
      tiles[y][x] = Tiles.FLOOR;
      console.log(`Y Corridor: ${x} ${y}`);
    }
  }

  _pickNLocations(tiles, n) {
    const { Tiles } = window.jwb.types;
    /**
     * @type {{ x: int, y: int }[]}
     */
    const floorTileLocations = [];
    const enemyLocations = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === Tiles.FLOOR) {
          floorTileLocations.push({ x, y });
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const index = this._randInt(0, floorTileLocations.length - 1);
      const { x, y } = floorTileLocations[index];
      enemyLocations.push({ x, y});
      floorTileLocations.splice(index, 1);
    }
    return enemyLocations;
  }

  _getPlayerLocation(tiles, enemyLocations) {
    const { Tiles } = window.jwb.types;
    /**
     * @type {{ x: int, y: int }[]}
     */
    const candidateLocations = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === Tiles.FLOOR) {
          if (enemyLocations.findIndex(loc => loc.x === x && loc.y === y) === -1) {
            candidateLocations.push({x, y});
          }
        }
      }
    }
    return candidateLocations[this._randInt(0, candidateLocations.length - 1)];
  }
}