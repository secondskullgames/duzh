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

/**
 *
 * @param {int} minRoomDimension outer width, including wall
 * @param {int} minRoomPadding
 * @constructor
 */
function BSPDungeonGenerator(minRoomDimension, minRoomPadding) {
  const { MapUtils, RandomUtils } = jwb.utils;
  const { pickUnoccupiedLocations } = MapUtils;
  const { randInt, randChoice } = RandomUtils;

  /**
   * @param {int} width
   * @param {int} height
   * @param {int} numEnemies
   * @param {Function<Coordinates, Unit>} enemyUnitSupplier
   * @param {int} numItems
   * @param {Function<Coordinates, Item>} itemSupplier
   * @return MapSupplier
   */
  function generateDungeon(width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier) {
    const { Tiles } = jwb.types;
    const section = _generateSection(width, height);
    const { tiles } = section;
    const [stairsLocation] = pickUnoccupiedLocations(tiles, [Tiles.FLOOR], [], 1);
    const [playerLocation] = pickUnoccupiedLocations(tiles, [Tiles.FLOOR, Tiles.FLOOR_HALL], [stairsLocation], 1);
    const enemyLocations = pickUnoccupiedLocations(tiles, [Tiles.FLOOR, Tiles.FLOOR_HALL], [stairsLocation, playerLocation], numEnemies);
    const itemLocations = pickUnoccupiedLocations(tiles, [Tiles.FLOOR, Tiles.FLOOR_HALL], [stairsLocation, playerLocation, ...enemyLocations], numItems);
    tiles[stairsLocation.y][stairsLocation.x] = Tiles.STAIRS_DOWN;
    return new MapSupplier(width, height, tiles, playerLocation, enemyLocations, enemyUnitSupplier, itemLocations, itemSupplier)
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
  function _generateSection(width, height) {
    // First, make sure the area is large enough to support two sections; if not, we're done
    const minSectionDimension = minRoomDimension + (2 * minRoomPadding);
    const canSplitHorizontally = (width >= (2 * minSectionDimension));
    const canSplitVertically = (height >= (2 * minSectionDimension));

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
      const direction = randChoice(splitDirections);
      if (direction === 'HORIZONTAL') {
        const splitX = _getSplitPoint(width);
        const leftWidth = splitX;
        const rightWidth = width - splitX;
        const leftSection = _generateSection(leftWidth, height);
        const rightSection = _generateSection(rightWidth, height);

        const tiles = [];
        for (let y = 0; y < leftSection.tiles.length; y++) {
          const row = [...leftSection.tiles[y], ...rightSection.tiles[y]];
          tiles.push(row);
        }
        _joinSectionsHorizontally(tiles, leftSection, rightSection);
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
        const splitY = _getSplitPoint(height);
        const topHeight = splitY;
        const bottomHeight = height - splitY;
        const topSection = _generateSection(width, topHeight);
        const bottomSection = _generateSection(width, bottomHeight);
        const tiles = [...topSection.tiles, ...bottomSection.tiles];
        _joinSectionsVertically(tiles, topSection, bottomSection);
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
      return _generateSingleSection(width, height);
    }
  }

  /**
   * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
   * anywhere in the region at random, and can occupy a variable amount of space in the region
   * (within the specified parameters).
   *
   * @param {int} width section width
   * @param {int} height section height
   * @return {MapSection}
   * @private
   */
  function  _generateSingleSection(width, height) {
    const { Tiles } = jwb.types;
    const maxRoomWidth = width - (2 * minRoomPadding);
    const maxRoomHeight = height - (2 * minRoomPadding);
    const roomWidth = randInt(minRoomDimension, maxRoomWidth);
    const roomHeight = randInt(minRoomDimension, maxRoomHeight);
    const roomTiles = _generateRoom(roomWidth, roomHeight);

    const roomLeft = randInt(minRoomPadding, width - roomWidth - minRoomPadding);
    const roomTop = randInt(minRoomPadding, height - roomHeight - minRoomPadding);
    const tiles = [];
    // x, y are relative to the section's origin
    // roomX, roomY are relative to the room's origin
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      const roomY = y - roomTop;
      for (let x = 0; x < width; x++) {
        const roomX = x - roomLeft;

        if (roomX >= 0 && roomX < roomWidth && roomY >= 0 && roomY < roomHeight) {
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
  function _generateRoom(width, height) {
    const { Tiles } = jwb.types;
    const tiles = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        if (x > 0 && x < (width - 1) && y === 0) {
          tiles[y][x] = Tiles.TOP_WALL;
        } else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
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
  function _getSplitPoint(dimension) {
    const minSectionDimension = minRoomDimension + 2 * minRoomPadding;
    const minSplitPoint = minSectionDimension;
    const maxSplitPoint = dimension - minSectionDimension;
    return randInt(minSplitPoint, maxSplitPoint);
  }

  /**
   * TODO this does not account for the case where there's no straight line between the two rooms.
   * Deal with this with multi-part paths in the future.
   *
   * @param {Tiles[][]} tiles The tiles of both leftSection and rightSection
   * @param {MapSection} leftSection
   * @param {MapSection} rightSection
   */
  function _joinSectionsHorizontally(tiles, leftSection, rightSection) {
    const { Tiles } = jwb.types;
    const { randChoice } = jwb.utils.RandomUtils;
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

    if (candidates.length > 0) {
      const { y, leftRoom, rightRoom } = randChoice(candidates) || {};
      for (let x = leftRoom.left + leftRoom.width - 1; x <= rightRoom.left + leftSection.width; x++) {
        tiles[y][x] = Tiles.FLOOR_HALL;
      }
    } else {
      console.log('Error connecting horizontally:');
      _logSections(leftSection, rightSection);
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
  function _joinSectionsVertically(tiles, topSection, bottomSection) {
    const { Tiles } = jwb.types;
    const { randChoice } = jwb.utils.RandomUtils;

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

    if (candidates.length > 0) {
      const { x, topRoom, bottomRoom } = randChoice(candidates) || {};

      for (let y = topRoom.top + topRoom.height - 1; y <= bottomRoom.top + topSection.height; y++) {
        tiles[y][x] = Tiles.FLOOR_HALL;
      }
    } else {
      console.log('Error connecting vertically:');
      _logSections(topSection, bottomSection);
    }
  }

  function _logSections(name, ...sections) {
    console.log(`Sections for ${name}:`);
    sections.forEach(section => console.log(section.tiles
      .map(row => row.map(tile => tile.char).join(''))
      .join('\n')));
    console.log();
  }

  return {
    generateDungeon
  };
}
