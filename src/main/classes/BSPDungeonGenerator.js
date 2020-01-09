/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
 */

/**
 * @typedef MapSection
 * {{
 *   width: int,
 *   height: int,
 *   rooms: Rect[],
 *   tiles: Tile[][]
 * }}
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
    const section = this._generateSection(width, height);
    const { tiles } = section;
    const enemyLocations = this._pickEnemyLocations(tiles, numEnemies);
    const playerLocation = this._pickPlayerLocation(tiles, enemyLocations);
    return new MapSupplier(width, height, tiles, playerLocation, enemyLocations, enemyUnitSupplier, [])
  }

  /**
   * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
   * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
   * not large enough to form two sub-regions, just return a single section.
   *
   * @param {int} width
   * @param {int} height
   * @return {MapSection}
   * @private
   */
  _generateSection(width, height) {
    // First, make sure the area is large enough to support two sections; if not, we're done
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
      const direction = this._randChoice(splitDirections);
      if (direction === 'HORIZONTAL') {
        const splitX = this._getSplitPoint(width);
        const leftWidth = splitX;
        const rightWidth = width - splitX;
        const leftSection = this._generateSection(leftWidth, height);
        const rightSection = this._generateSection(rightWidth, height);

        const tiles = [];
        for (let y = 0; y < leftSection.tiles.length; y++) {
          tiles[y] = [...leftSection.tiles[y], ...rightSection.tiles[y]];
        }
        this._joinSectionsHorizontally(tiles, leftSection, rightSection);
        // rightSection.rooms are relative to its own origin, we need to offset them by rightSection's coordinates
        // relative to this section's coordinates
        const rightRooms = rightSection.rooms
          .map(room => ({ ...room, left: room.left + splitX }));

        return {
          width,
          height,
          rooms: [...leftSection.rooms, ...rightRooms],
          tiles
        };
      } else {
        const splitY = this._getSplitPoint(height);
        const topHeight = splitY;
        const bottomHeight = height - splitY;
        const topSection = this._generateSection(width, topHeight);
        const bottomSection = this._generateSection(width, bottomHeight);
        const tiles =  [...topSection.tiles, ...bottomSection.tiles];
        this._joinSectionsVertically(tiles, topSection, bottomSection);
        const bottomRooms = bottomSection.rooms
          .map(room => ({ ...room, top: room.top + splitY }));
        return {
          width,
          height,
          rooms: [...topSection.rooms, ...bottomRooms],
          tiles
        };
      }
    } else {
      // Base case: return a single section
      return this._generateSingleSection(width, height);
    }
  }

  /**
   * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
   * anywhere in the region at random, and can occupy a variable amount of space in the region
   * (within the specified parameters).
   *
   * @param {int} width
   * @param {int} height
   * @return {MapSection}
   * @private
   */
  _generateSingleSection(width, height) {
    const { Tiles } = window.jwb.types;
    const roomWidth = this._randInt(this.minRoomDimension, width);
    const roomHeight = this._randInt(this.minRoomDimension, height);
    const roomTiles = this._generateRoom(roomWidth, roomHeight);

    const roomLeft = this._randInt(0, width - roomWidth);
    const roomTop = this._randInt(0, height - roomHeight);
    const tiles = [];
    // x, y are relative to the section's origin
    // roomX, roomY are relative to the room's origin
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      const roomY = y - roomTop;
      for (let x = 0; x < width; x++) {
        const roomX = x - roomLeft;

        if (roomX >= 0 && roomX < roomTiles[0].length && roomY >= 0 && roomY < roomTiles.length) {
          tiles[y][x] = roomTiles[roomY][roomX];
        } else {
          tiles[y][x] = Tiles.NONE;
        }
      }
    }

    const rooms = [{ left: roomLeft, top: roomTop, width: roomWidth, height: roomHeight }];
    return { width, height, rooms, tiles };
  }

  /**
   * @param {int} width
   * @param {int} height
   * @return {Tile[][]}
   * @private
   */
  _generateRoom(width, height) {
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

  _randChoice(list) {
    return list[this._randInt(0, list.length - 1)];
  }

  /**
   * TODO this does not account for the case where there's no straight line between the two rooms.
   * Deal with this with multi-part paths in the future.
   *
   * @param {Tiles[][]} tiles The tiles of both leftSection and rightSection
   * @param {MapSection} leftSection
   * @param {MapSection} rightSection
   */
  _joinSectionsHorizontally(tiles, leftSection, rightSection) {
    this._logSections('HORIZONTAL', leftSection, rightSection);
    const { Tiles } = window.jwb.types;
    /**
     * @type {{ y: int, leftRoom: Rect, rightRoom: Rect}[]}
     */
    const candidates = tiles
      .map((_, y) => {
        const leftRooms = leftSection.rooms
          .filter(room => (y >= room.top && y <= (room.top + room.height - 1)));
        const rightRooms = rightSection.rooms
          .filter(room => (y >= room.top && y <= (room.top + room.height - 1)));


        const leftRoom = leftRooms.sort((a, b) => (b.left - a.left))[0]; // find the *max* left coordinate
        const rightRoom = rightRooms.sort((a, b) => (a.left - b.left))[0]; // find the *min* left coordinate

        if (leftRoom && (y > leftRoom.top) && (y < (leftRoom.top + leftRoom.height - 1))) {
          if (rightRoom && (y > rightRoom.top) && (y < (rightRoom.top + rightRoom.height - 1))) {
            return { y, leftRoom, rightRoom };
          }
        }

        return null;
      })
      .filter(obj => !!obj);

    const { y, leftRoom, rightRoom } = this._randChoice(candidates);

    for (let x = leftRoom.left + leftRoom.width - 1; x <= rightRoom.left + leftSection.width; x++) {
      tiles[y][x] = Tiles.FLOOR;
    }
  }

  /**
   * TODO this does not account for the case where there's no straight line between the two rooms.
   * Deal with this with multi-part paths in the future.
   *
   * @param {Tile[][]} tiles The tiles of both topSection and bottomSection
   * @param {MapSection} topSection
   * @param {MapSection} bottomSection
   */
  _joinSectionsVertically(tiles, topSection, bottomSection) {
    this._logSections('VERTICAL', topSection, bottomSection);
    const { Tiles } = window.jwb.types;

    /**
     * @type {{ x: int, topRoom: Rect, bottomRoom: Rect}[]}
     */
    const candidates = tiles[0]
      .map((_, x) => {
        const topRooms = topSection.rooms
          .filter(room => (x >= room.left && x <= (room.left + room.width - 1)));
        const bottomRooms = bottomSection.rooms
          .filter(room => (x >= room.left && x <= (room.left + room.width - 1)));


        const topRoom = topRooms.sort((a, b) => (b.top - a.top))[0]; // find the *max* top coordinate
        const bottomRoom = bottomRooms.sort((a, b) => (a.top - b.top))[0]; // find the *min* top coordinate

        if (topRoom && (x > topRoom.left) && (x < (topRoom.left + topRoom.width - 1))) {
          if (bottomRoom && (x > bottomRoom.left) && (x < (bottomRoom.left + bottomRoom.width - 1))) {
            return { x, topRoom, bottomRoom };
          }
        }

        return null;
      })
      .filter(obj => !!obj);

    const { x, topRoom, bottomRoom } = this._randChoice(candidates);

    for (let y = topRoom.top + topRoom.height - 1; y <= bottomRoom.top + topSection.height; y++) {
      tiles[y][x] = Tiles.FLOOR;
    }
  }

  _pickEnemyLocations(tiles, n) {
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

  _pickPlayerLocation(tiles, enemyLocations) {
    const { Tiles } = window.jwb.types;
    /**
     * @type {{ x: int, y: int }[]}
     */
    const candidateLocations = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === Tiles.FLOOR) {
          if (enemyLocations.findIndex(loc => loc.x === x && loc.y === y) === -1) {
            candidateLocations.push({ x, y });
          }
        }
      }
    }
    return this._randChoice(candidateLocations);
  }

  _pickStairsLocation(tiles) {
    const { Tiles } = window.jwb.types;
    /**
     * @type {{ x: int, y: int }[]}
     */
    const candidateLocations = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === Tiles.FLOOR) {
          candidateLocations.push({ x, y });
        }
      }
    }
    return this._randChoice(candidateLocations);
  }

  _logSections(name, ...sections) {
    console.log(`Sections for ${name}:`);
    sections.forEach(section => console.log(section.tiles
      .map(row => row.map(tile => tile.char).join(''))
      .join('\n')));
    console.log();
  }
}